// Task scheduler to break up long-running tasks and reduce TBT

interface TaskOptions {
  priority?: 'immediate' | 'user-blocking' | 'user-visible' | 'background';
  timeout?: number;
}

// Modern scheduler API with fallback
export const scheduleTask = (callback: () => void, options: TaskOptions = {}) => {
  const { priority = 'background', timeout = 5000 } = options;
  
  // Use modern scheduler API if available
  if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
    return (window as any).scheduler.postTask(callback, { priority });
  }
  
  // Fallback to requestIdleCallback for background tasks
  if (priority === 'background' && 'requestIdleCallback' in window) {
    return requestIdleCallback(callback, { timeout });
  }
  
  // Immediate execution for critical tasks
  if (priority === 'immediate') {
    return callback();
  }
  
  // Use setTimeout with yielding for other tasks
  return setTimeout(callback, 0);
};

// Break up synchronous work into smaller chunks
export const yieldingForEach = async <T>(
  items: T[], 
  callback: (item: T, index: number) => void,
  chunkSize = 5
) => {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    
    // Process chunk synchronously
    chunk.forEach((item, chunkIndex) => {
      callback(item, i + chunkIndex);
    });
    
    // Yield to main thread after each chunk
    if (i + chunkSize < items.length) {
      await new Promise<void>(resolve => {
        scheduleTask(() => resolve(), { priority: 'background' });
      });
    }
  }
};

// Debounced task execution to prevent flooding
export const createDebouncedScheduler = (delay = 16) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (callback: () => void, options: TaskOptions = {}) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      scheduleTask(callback, options);
      timeoutId = null;
    }, delay);
  };
};

// Measure and log long tasks for debugging
export const measureTask = (name: string, task: () => void) => {
  const start = performance.now();
  task();
  const duration = performance.now() - start;
  
  // Log tasks that might contribute to TBT
  if (duration > 50) {
    console.warn(`Long task detected: ${name} took ${duration.toFixed(2)}ms`);
  }
  
  return duration;
};

// Progressive loading utility
export const progressivelyLoad = <T>(
  items: T[],
  callback: (batch: T[]) => void,
  batchSize = 10,
  delay = 100
) => {
  let index = 0;
  
  const loadBatch = () => {
    const batch = items.slice(index, index + batchSize);
    if (batch.length > 0) {
      callback(batch);
      index += batchSize;
      
      if (index < items.length) {
        scheduleTask(loadBatch, { priority: 'background' });
      }
    }
  };
  
  // Start loading first batch immediately
  loadBatch();
};
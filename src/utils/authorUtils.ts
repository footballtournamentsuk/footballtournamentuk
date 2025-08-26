// Owner user ID - update this with the actual owner user ID
export const OWNER_USER_ID = '7f8e1234-abcd-5678-9012-345678901234' // Replace with actual owner ID

export function getAuthorDisplayName(authorId?: string, profiles?: { full_name?: string; contact_email: string }): string {
  if (authorId === OWNER_USER_ID) {
    return 'Admin'
  }
  
  if (profiles?.full_name) {
    return profiles.full_name
  }
  
  // Fallback to email without domain if no full name
  if (profiles?.contact_email) {
    return profiles.contact_email.split('@')[0]
  }
  
  return 'Admin' // Default fallback
}

export function getMetaAuthor(authorId?: string): string {
  if (authorId === OWNER_USER_ID) {
    return 'Admin'
  }
  return 'Admin' // For meta tags, always use Admin for consistency
}
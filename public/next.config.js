{
  "trailingSlash": false,
  "redirects": [
    {
      "source": "/alerts/verify",
      "destination": "/",
      "statusCode": 200
    },
    {
      "source": "/alerts/verify/:token",
      "destination": "/",
      "statusCode": 200
    },
    {
      "source": "/alerts/manage/:token",
      "destination": "/",
      "statusCode": 200
    }
  ],
  "rewrites": [
    {
      "source": "/alerts/(.*)",
      "destination": "/index.html"
    },
    {
      "source": "/((?!api|_next/static|_next/image|favicon|robots|sitemap|manifest|.*\\.).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/alerts/(.*)",
      "headers": [
        {
          "key": "X-Robots-Tag",
          "value": "noindex, nofollow"
        },
        {
          "key": "Cache-Control", 
          "value": "no-store, no-cache, must-revalidate"
        }
      ]
    }
  ]
}
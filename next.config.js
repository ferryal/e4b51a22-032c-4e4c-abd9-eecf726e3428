/** @type {import('next').NextConfig} */

module.exports = {
    async redirects() {
      return [
        {
          source: '/',
          destination: '/users',
          permanent: true,
        },
      ]
    },
  }
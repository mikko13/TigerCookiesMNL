module.exports = {
    webpack: {
      configure: {
        resolve: {
          fallback: {
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            fs: require.resolve('browserify-fs')
          }
        }
      }
    }
  };
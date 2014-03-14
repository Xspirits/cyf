    module.exports = function(grunt) {
      grunt.initConfig ({
        connect: {
          options: {
            port: 9000,
            // Change this to '0.0.0.0' to access the server from outside.
            hostname: '0.0.0.0'
          },
        },
        compass: {
          dist: {
            options: {
              config: 'config/compass.rb'
            }
          }
        },
        watch: {
          source: {
            files: ['sass/*.scss'],
            tasks: ['compass'],
            options: {
            livereload: true, // needed to run LiveReload
          }
        }
      }
    });
      grunt.loadNpmTasks('grunt-contrib-watch');
      grunt.loadNpmTasks('grunt-contrib-compass');
      grunt.registerTask('default', ['watch']);
    };
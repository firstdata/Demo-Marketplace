module.exports = function(grunt) {
  grunt.initConfig({
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['./web/js/**/*.js'],
        dest: './web/fd.js',
      },
    },
    jsvalidate: {
      options:{
        globals: {},
        esprimaOptions: {},
        verbose: true
      },
      targetName:{
        files:{
          src:['./web/js/**/*.js']
        }
      }
    },
    watch: {
      scripts: {
        files: ['./web/js/**/*.js', './web/stylesheets/main.css'],
        tasks: ['concat', 'jsvalidate'],
        options: {
          spawn: false,
        },
      },
    }
  });

  
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsvalidate');


  grunt.registerTask('default', ['watch']);
  
  grunt.registerTask('deploy', ['concat']);
};

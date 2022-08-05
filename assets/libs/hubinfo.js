/*!
 * hubinfo - a github repo info javascript widget
 * v0.2.0
 * https://github.com/firstandthird/hubinfo
 * copyright First+Third 2014
 * MIT License
*/

(function($) {
  var getProjectInfo = function(user, repo, cb) {
    $.ajax({
      url: 'https://api.github.com/repos/'+user+'/'+repo,
      dataType: 'jsonp',
      success: function(res) {
        if (res.data.message == 'Not Found')
          throw new Error('Invalid user or repo');
        cb(res.data);
      }
    });
  };

  var getLastCommit = function(user, repo, cb) {
    $.ajax({
      url: 'https://api.github.com/repos/'+user+'/'+repo+'/commits',
      dataType: 'jsonp',
      success: function(json) {
        var latest = json.data[0];
        cb(latest);
      }
    });
  };

  var fetchData = function(user, repo, cb) {
    var count = 0;
    var total = 2;
    var projectInfo;
    var lastCommit;
    var check = function() {
      if (count == total)
        cb(projectInfo, lastCommit);
    };
    getProjectInfo(user, repo, function(project) {
      count++;
      projectInfo = project;
      check();
    });
    getLastCommit(user, repo, function(commit) {
      count++;
      lastCommit = commit;
      check();
    });
  };

  var relativeDate = function(date) {
    if (typeof date === 'string') {
      var d = date.split('T')[0].split('-');
      date = new Date(d[0], d[1]-1, d[2]);
    }
    var today = new Date().getTime();
    var diff = today - date.getTime();
    var seconds = diff / 1000;
    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) {
      return 'today';
    } else if (days > 30) {
      return Math.floor(days / 30) + ' month(s) ago';
    }
    return days + ' day(s) ago';
  };

  $.fn.hubInfo = function(options) {
    var opts = $.extend({}, $.fn.hubInfo.defaults, options);
    var self = this;

    fetchData(opts.user, opts.repo, function(project, lastCommit) {
      if (opts.debug) {
        console.log(arguments);
      }
      
      self.each(function(i, item) {
        var tmpl = $(opts.template);
        tmpl
          .find('.repo-lang')
            .html(project.language)
            .end()
          .find('.repo-watchers')
            .html(project.watchers)
            .attr('href', project.html_url)
            .end()
          .find('.repo-forks')
            .html(project.forks)
            .attr('href', project.html_url)
            .end()
          .find('.repo-name')
            .html(project.name)
            .attr('href', project.html_url)
            .end()
          .find('.repo-commit-message')
            .html(lastCommit.commit.message)
            .attr('href', 'https://github.com/'+opts.user+'/'+opts.repo+'/commit/' + lastCommit.sha)
            .end()
          .find('.repo-commit > div > span')
            .html("Commited " + relativeDate(lastCommit.commit.committer.date) + ": " )
            .end();

        var el = $(item);
        el.html(tmpl);
        el.trigger('render');
      
      });
    });
    return self;
  };

  $.fn.hubInfo.defaults = {
    user: '',
    repo: '',
    debug: false,
    template: [
      '<div class="github-repo">',

          //Cabecera
          '<div class="repo-header row">',
            '<div class="col">',
              // github image
              '<svg class="github-logo" height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" data-view-component="true" class="octicon octicon-mark-github v-align-middle">',
                '<path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>',
              '</svg>',
              //repo name
              '<a class="repo-name"></a>',
            '</div>',
          '</div>',

        // Estadisticas

          '<div class="row">',
            //Lang
            '<div class="col-auto pr-0">',
              '<span class="repo-label">Lang: </span><span class="repo-lang"></span>',
            '</div>',

            //Stats
            '<div class="repo-stats col-auto">',
              '<span class="repo-label">Stats: </span>',
              // Watchers
              '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-eye">',
                '<path fill-rule="evenodd" d="M1.679 7.932c.412-.621 1.242-1.75 2.366-2.717C5.175 4.242 6.527 3.5 8 3.5c1.473 0 2.824.742 3.955 1.715 1.124.967 1.954 2.096 2.366 2.717a.119.119 0 010 .136c-.412.621-1.242 1.75-2.366 2.717C10.825 11.758 9.473 12.5 8 12.5c-1.473 0-2.824-.742-3.955-1.715C2.92 9.818 2.09 8.69 1.679 8.068a.119.119 0 010-.136zM8 2c-1.981 0-3.67.992-4.933 2.078C1.797 5.169.88 6.423.43 7.1a1.619 1.619 0 000 1.798c.45.678 1.367 1.932 2.637 3.024C4.329 13.008 6.019 14 8 14c1.981 0 3.67-.992 4.933-2.078 1.27-1.091 2.187-2.345 2.637-3.023a1.619 1.619 0 000-1.798c-.45-.678-1.367-1.932-2.637-3.023C11.671 2.992 9.981 2 8 2zm0 8a2 2 0 100-4 2 2 0 000 4z"></path>',
              '</svg>',
              '<a class="repo-watchers"></a>',
              //Forks
              '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-repo-forked">',
                '<path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>',
              '</svg>',
              '<a class="repo-forks"></a>',
            '</div>',
          '</div>',

        //Comits
        '<div class="repo-commit row">',
          '<div class="col-auto">',
            '<span class="repo-label">Comit msg: </span>',
            '<a class="repo-commit-message"></a>',
          '</div>',
          // '<div class="repo-commit-date col-auto">', 
          //   //Inserta tiempo transcurrido en el span
          //   '<span></span>',
          // '</div>',
        '</div>',


      '</div>'
    ].join('')
  };
})(jQuery);



/*

'<div class="repo-commit row">',
    '<div class="col-auto">',
        '<span class="repo-label">Comit msg: </span>',
        '<a class="repo-commit-message"></a>',    
    '</div>',
    '<div class="repo-commit-date col-auto">', 
        '<span>Comitted: </span>',
    </div>,
</div>,


*/
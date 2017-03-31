'use strict';

var logger = require('winston'),
    grunt = require('grunt');

var githubService = require('./lib/services/github-service.js');

module.exports.updateChangelog = function (github, repository, version, callback) {

    logger.debug('Updating changelog.');
    if (!github) {
        grunt.fail.warn('Github configuration is required to get changelog from milestone');
    }

    githubService.getMilestoneByVersion(github, repository, version).then(function (milestone) {
        githubService.getIssuesByMilestone(github, repository, milestone.number).then(function (issues) {
            milestone.issues = issues;

            var now = new Date();
            var stringChangelog = "### " + milestone.title + ' - ' + now.getUTCFullYear() + '-' + ("0" + (now.getUTCMonth() + 1)).slice(-2) + 1 + '-' + ("0" + (now.getUTCDate())).slice(-2) + '\n\n';

            milestone.issues.forEach(function (element) {
                stringChangelog += '- [#' + element.number + '](' + element.html_url + ') - ' + element.title + '\n\n';
            });
            //logger.debug(stringChangelog);
            logger.debug(stringChangelog);
            logger.debug('Resolving promise');
            callback(stringChangelog);

        }, function (error) {
            logger.debug('Some error has ocurred ' + error.toString());
            callback(error);
        });
    }, function (error) {
        logger.debug(error.toString());
        callback(error);
    });

};

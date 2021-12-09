const generalConfig = {
    // A Wikibase instance is required
    instance: 'https://www.wikidata.org',

    // The instance script path, used to find the API endpoint
    // Default: /w
    wgScriptPath: '/w',

    // One authorization mean is required (unless in anonymous mode, see below)
    credentials: {
        // either a username and password
        username: 'my-wikidata-username',
        // Optional: generate a dedicated password with tailored rights on /wiki/Special:BotPasswords
        // See the 'Credentials' paragraph below
        password: 'my-wikidata-password',

        // OR OAuth tokens
        oauth: {
        // Obtained at registration
        // https://www.mediawiki.org/wiki/OAuth/For_Developers#Registration
        consumer_key: 'your-consumer-token',
        consumer_secret: 'your-secret-token',
        // Obtained when the user authorized your service
        // see https://www.mediawiki.org/wiki/OAuth/For_Developers#Authorization
        token: 'a-user-token',
        token_secret: 'a-secret-token'
        }
    },

    // Flag to activate the 'anonymous' mode,
    // which actually isn't anonymous as it signs with your IP
    // Default: false
    anonymous: true,

    // Optional
    // See https://meta.wikimedia.org/wiki/Help:Edit_summary
    // Default: empty
    summary: 'some edit summary common to all the edits',

    // See https://www.mediawiki.org/wiki/Manual:Tags
    // Default: on Wikidata [ 'WikibaseJS-edit' ], empty for other Wikibase instances
    tags: [ 'Some general tag' ],

    // Default: `wikidata-edit/${pkg.version} (https://github.com/maxlath/wikidata-edit)`
    userAgent: 'my-project-name/v3.2.5 (https://project.website)',

    // See https://www.mediawiki.org/wiki/Manual:Bots
    // Default: false
    bot: true,

    // See https://www.mediawiki.org/wiki/Manual:Maxlag_parameter
    // Default: 5
    maxlag: 2
}

const fs = require('fs')
const {generate, parse, transform, stringify} = require('csv');

const updated_at = 4
const pushed_at = 3
const clone_dir = 2
const name = 0

var Git = require("nodegit");
const execSync = require('child_process').execSync;

const updateRepo = function ( repository, callback ) {
    return repository.fetchAll(new Git.FetchOptions(), callback).then(function() {
        return repository;
    });
        
}
const getLastCommit = function( repository ) {
    return repository.getMasterCommit().then(function(commit) {
        return commit                                                                                                                                                                                                                                                                                                                                   
    });
}

format = "table" // "json" //

let byEmail = {}

fs.readFile('queries/week_day_query.sql', function (err, querySql) {
    fs.readFile('org/wmde/output.csv', function (err, fileData) {
        //console.log(fileData)
        parse(fileData, {columns: false, trim: true}, function(err, rows) {
        // Your CSV data is in an array of arrys passed to this callback as rows.
        let repo_index = 0
        for(repo_index = 0; repo_index < rows.length; repo_index++) {

            var local_path, repo_name, repo_dir;

            if (process.env.REPO) {
                local_path = process.env.REPO //'./repos/' + repo_name

                if(!local_path) {
                    throw new Error('REPO not set')
                }
            } else {
                repo_dir = rows[repo_index][clone_dir];
                repo_name = rows[repo_index][name]

                repo_updated_at = rows[repo_index][updated_at]
                repo_pushed_at = rows[repo_index][pushed_at]

                const day = 24 * 60 * 60 * 1000;
                const threshold = new Date().getTime() - ( 2 * day );

                

                repo_updated_at = new Date(repo_updated_at).getTime();
                repo_pushed_at = new Date(repo_pushed_at).getTime();


                if( repo_updated_at <= threshold || repo_pushed_at <= threshold ) {
                    continue;
                }  
                local_path = "./org/" + process.env.ORG_NAME + "/repos/" + repo_name

                console.log();
                console.log("######## %s", repo_name)
                console.log("now:", threshold)
                console.log("updated_at: ", repo_updated_at);
                console.log("pushed_at: ", repo_pushed_at)
            
            }

            console.log("- Reading " + local_path)
            
            const execRes = execSync("/app/askgit --repo=\"" + local_path + "\" \"" + querySql + '" --format ' + format ); //(), (error, stdout, stderr) => {
            

            if (format == 'json') {
                const rows = execRes.toString('utf-8').split("\n");
                let jsonRows = [];
                for(i = 0; i < rows.length; i++) {
                    try{
                        let json = JSON.parse(rows[i]);
                        jsonRows.push(json)

                    } catch(error) {
                        //console.log(error);
                    }
                }
                if(jsonRows.length) {
                    console.log(jsonRows);
                    for(x = 0; x < jsonRows.length; x++) {
                        const email = jsonRows[x].author_email
                        
                        if ( byEmail[email] === undefined ) {
                            byEmail[email] = jsonRows[x].commits;
                        } else {
                            byEmail[email] += jsonRows[x].commits;
                        }

                    }
                }

            } else {
                console.log(execRes.toString('utf-8'));
            }

            //console.log(byEmail);
        }
        console.log(byEmail)
      })
    })
})


//const wbEdit = require('wikibase-edit')(generalConfig)
//wbEdit.label.set({ id, language, value })

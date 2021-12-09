#!/bin/bash
set -e

# No of reposoitories per page - Maximum Limit is 100
PERPAGE=100
# Change the BASEURL to  your Org or User based
# Org base URL
BASEURL="https://api.github.com/orgs/$ORG_NAME/repos"
# User base URL
# BASEURL="https://api.github.com/user/<your_github_username>/repos"

if [ -z "$ORG_NAME" ]; then
  echo "ORG_NAME not set"
  exit 1
fi

# Calculating the Total Pages after enabling Pagination
TOTALPAGES=`curl -I -i -u $USERNAME:$TOKEN -H "Accept: application/vnd.github.v3+json" -s ${BASEURL}\?per_page\=${PERPAGE} | grep -i link: 2>/dev/null|sed 's/link: //g'|awk -F',' -v  ORS='\n' '{ for (i = 1; i <= NF; i++) print $i }'|grep -i last|awk '{print $1}' | tr -d '\<\>' | tr '\?\&' ' '|awk '{print $3}'| tr -d '=;page'`
i=1

mkdir -p repos/

#echo "name,ssh_url,clone_url,pushed_at,updated_at,created_at,open_issues"

if [ "$TOTALPAGES" != "" ]; then
  until [ $i -gt "$TOTALPAGES" ]
  do
    if [ "$i" -gt "$START" ]; then
      result=`curl -s -u $USERNAME:$TOKEN -H 'Accept: application/vnd.github.v3+json' ${BASEURL}?per_page=${PERPAGE}\&page=${i} 2>&1`
      echo $result > tempfile
      cat tempfile|jq '.[]| [.name, .ssh_url, .clone_url, .pushed_at, .updated_at, .created_at, .open_issues]| @csv'|tr -d '\\"'

      if [ $ONLY_ONE_PAGE_PER_JOB == 1 ]; then
        ((i=$TOTALPAGES))
      fi
    fi 

    ((i=$i+1))


  done

  rm -f tempfile
else
  echo "Didnt get TOTALPAGES"
fi
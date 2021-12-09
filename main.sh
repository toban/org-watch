#!/bin/bash
set -e
#bash csv.sh > output.csv

mkdir -p ./org/${ORG_NAME}/

while IFS=, read -r name ssh_url clone_url pushed_at updated_at created_at open_issues
do
    #if "$clone_url" != 'clone_url'; then

    t1=$(date --date="$updated_at" +%s)

    # Date 2 : Current date
    dt2=$(date +%Y-%m-%d\ %H:%M:%S)
    # Compute the seconds since epoch for date 2
    t2=$(date --date="$dt2" +%s)
    # Compute the difference in dates in seconds
    let "tDiff=$t2-$t1"

    if [ $tDiff -lt 3600 ]; then
        continue
    fi
    # Compute the approximate hour difference
    let "hDiff=$tDiff/3600"

    if [ $hDiff -gt 48 ]; then
        continue
    fi

    path="./org/$ORG_NAME/repos/$name"
    if [ ! -d $path ]; then
        echo "cloning $name from $clone_url"
        git clone "$clone_url" $path -q
    fi
    cd $path
    echo "- fetching all for $name"
    git fetch --all -q
    git pull -q
    cd - > /dev/null

done < "./org/$ORG_NAME/output.csv"
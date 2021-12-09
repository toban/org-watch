FROM augmentable/askgit:latest
RUN apt-get update && apt-get install nodejs --yes
COPY . /org-watch/
WORKDIR /org-watch/
ENTRYPOINT bash /org-watch/entrypoint.sh
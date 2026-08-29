FROM ruby:3.3.4

ARG GITHUB_PAGES_VERSION=232

RUN gem install github-pages --version "${GITHUB_PAGES_VERSION}" --no-document \
    && gem install webrick --no-document

WORKDIR /site

EXPOSE 4000 35729

CMD ["jekyll", "serve", "--host", "0.0.0.0", "--port", "4000", "--livereload", "--livereload-port", "35729", "--force_polling", "--baseurl", "", "--destination", "/tmp/berrrrr-site"]

ARG ROCKY_VERSION=8.9

FROM rockylinux:${ROCKY_VERSION} AS nodejs

ENV WORKDIR="/srv/www"
# Install utilities, Node.js, and other dependencies
RUN dnf -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm \
    && dnf update -y \
    && dnf install -y \
    mc \
    htop \
    git \
    curl

RUN curl --silent --location https://rpm.nodesource.com/setup_16.x | bash - \
    && dnf -y install nodejs

WORKDIR ${WORKDIR}

COPY .docker/bin/nodejs-entrypoint /usr/local/bin/docker-entrypoint

EXPOSE 7547 3000 7557
ENTRYPOINT ["docker-entrypoint"]
CMD ["npm", "run", "start"]

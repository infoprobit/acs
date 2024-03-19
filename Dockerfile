ARG CENTOS_VERSION=7.9.2009

FROM --platform=linux/amd64 centos:${CENTOS_VERSION} AS nodejs

# Install utilities, Node.js, and other dependencies
RUN yum -y update && \
    yum -y install epel-release && \
    yum -y install mc htop nodejs npm git && \
    yum clean all

WORKDIR /srv/www
COPY .docker/bin/nodejs-entrypoint /usr/local/bin/docker-entrypoint

EXPOSE 7547 3000 7557
ENTRYPOINT ["docker-entrypoint"]
CMD ["npm", "run", "start"]

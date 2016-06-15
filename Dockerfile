FROM node:5.4

# using a symlink, install node_modules outside of /app directory. This allows one to mount a volume of thier local app dir into /app and not have the volume mount obscure access to the node_modules. Anyone wishing to mount a directory at /app should ensure this symlink exists in the local tree
RUN mkdir -p /opt/node_modules /app
RUN ln -s /opt/node_modules /app/node_modules

ENV PATH /opt/node_modules/.bin:$PATH

WORKDIR /app

COPY package.json /app/

RUN npm install

ENV TMPDIR /tmp/
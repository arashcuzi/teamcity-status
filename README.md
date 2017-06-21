#teamcity-status-node

A node.js build status indicator for TeamCity that works on Raspberry Pi as well as Linux, Mac and PC.

##Configuration
Open config.json and setup for your environment. You will need TeamCity's URL, and creds to connect. Also for the slack integration you need to add the WebHook.

###For running locally

Clone the repo:

```shell
git clone <https/ssh_url>
```

Then install deps and run:

```shell
npm install && npm start
```

The app is also Docker ready:

```shell
docker build -t <teamcity_status> .
```

Then:

```shell
docker run -d <teamcity_status>
```

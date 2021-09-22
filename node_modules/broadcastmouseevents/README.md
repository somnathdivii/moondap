BroadCast Mouse Position
=========
NodeJS experiment to broadcast your mouse position, mouse click and scroll to all the other clients.

Requirements
----
  - Express
  - Socket.io
  
  ```sh
sudo npm install
```

Demo
----
To see the effect open this link in multiple browser windows

[Broadcast Mouse position Demo](http://dutchprogrammer.nl:9002/)


How to start
----
  All experiments can be start with the broadCastMousePosition.js
```sh
sudo nodejs broadCastMousePosition.js
```
  How to start this chat as an service:
----

  
 ```sh
 sudo forever start -l forever.log -o out.log -e err.log -a broadCastMousePosition.js
  ```
  
Problems and fixes
----

When you got problems with ubuntu server because it can't find the node command execute the following line:

```sh
sudo update-alternatives --install /usr/sbin/node node /usr/bin/nodejs 99
```

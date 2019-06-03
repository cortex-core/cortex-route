#!/bin/bash
set -e

if [ "$1" = 'init_alias' ]; then
   sudo ip address add 127.0.0.2/8 dev lo
fi
cd service
npm start
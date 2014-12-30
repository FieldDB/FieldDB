#!/bin/bash
CURRENTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.."

cd angular_client/modules/spreadsheet &&
rm -rf bower_components

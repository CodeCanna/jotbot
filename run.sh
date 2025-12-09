#!/usr/bin/env bash
file="$1";
run="$2";

declare -a keys;
declare -i code;

# Get the api keys
function get_keys() {
    if [ ! -f $file ]; then
        echo "File not found!: $file";
        return 1;
    fi
        
    line_number=0;
    while read line; do
        keys[line_number]="$line";
        line_number+=1;
    done < "$file";
}

# Setup the environment variables based on the keys found in the passed file
function setup_env() {
    export TELEGRAM_BOT_KEY=${keys[0]};
}

if [ ! $file ]; then
    echo "No key file passed, exitting.";
    exit 1;
fi

# Get keys
get_keys;
if [ $? != 0 ]; then
    echo "Failed to extract keys from file path provided!  Failed to start bot.";
    exit 1;
fi

# Setup the environment variables
setup_env;
if [ $? != 0 ]; then
    echo "Failed to setup environment variables!  Failed to start bot.";
    exit 1;
fi

# Process args
case $run in
    "dev") deno run dev;;
    "test") deno run test;;
    "exe") ./IcebreakerBot;;
    *) echo "Invalid option detected: $run, Expecting dev or test";;
esac
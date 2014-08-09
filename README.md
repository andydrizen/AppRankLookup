# About

Lookup the rank of any App using this command-line interface.

# Usage

Set the (key, value) of the variable `default` to be the (App ID, name) of the Apps in which are you interested.

For example, to get the rank of the App "Tube Tracker", your `defaults` object would look like this:

```
var defaults = {
   "441139371" : "Tube Tracker"
};
```

Then simply execute `node index.js` from the command line.

Alternatively, you can use the command line interface (CLI) to lookup the rank of Apps, for example,

```
node index.js 441139371
```
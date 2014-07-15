# Moore Foundation Ocean Maps

This project will map a variety of ocean protection areas ranging from thousands of square miles in the Pacific to a few square miles off Massachusetts. The maps will likely use an equal-area projection to reduce distortion, but one of the design challenges will be making that projection intelligible even when the zoom is very close, like in the Cape Cod example.

Another key priority of the client is that  updates are easy. Updates will be of a couple forms:

1. Metadata about a protected area already on the map will change, as when a pending area is approved
2. A new area is added to the map.

In the case of #1, as much non-geo data as possible should be accessed from CSV files that can be edited in any spreadsheet program or text editor. for #2, geo data should be assumed to come as shapefiles with a documented standard format but no programmatic effort to transform non-compliant files to that format. Ideally, such data would be read directly from the filesystem, with no intervening database.

## Branches (if appropriate)

* List, describe, and link

To clone a specific branch (to prevent having to switch branches when working
on different components), use:

```bash
git clone git@github.com:stamen/repo-name.git -b <branch> repo-name-<branch>
```

## Heroku Apps (if appropriate)

* List, describe, and link

## Installation

```bash
npm install
...
```

## Usage + Configuration (specifically for libraries)

```javascript
// this is some sample code showing how things are used
```

## Environment Variables (if appropriate)

This can be configured using the following environment variables:

* `ENV_VAR_1` - Purpose of this variable. Defaults to _x_.

## Dependencies

### Software

_(These are implicit dependencies beyond what gets installed during the [installation](#Installation) step.)_

Postgres? Javascript libraries? SASS? List 'em!

### Data

* CSV meta data about ocean protected areas, economic zones, and potentially other designated areas offshore.
* This is a static data project with no database backend.
* At kickoff, it's not known whether we'll need a preprocessor for shapefiles to bake tiles. If so, consider learning from the [EDF project](https://github.com/stamen/edf), which used a Vagrant instance to process data into tiles. Brandon Liu and Eric Gelinas built that system.

### Static Assets

* Location and (basic) description of images, existing CSS, HTML, etc.

## How do I test it other than locally?

Are we using [prosthetic](https://github.com/stamen/prosthetic) or are there any other special methods required for testing? Describe those here if so.

## Deployment

If this is a live thing in the world, how do we push changes to the live thing?
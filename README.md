### About the Enyo Community Gallery ###

We are really excited by the amount of collaboration and sharing happening in the [Enyo Forums](http://forums.enyojs.com/), and the initial release of the [Enyo Community Gallery](http://enyojs.com/gallery) is a first step at providing a way to showcase and discover new Enyo add-on components and libraries developed by the community.  There are a lot of directions we can go with this, like adding search, categorization, and even dependency management, but for now we wanted to get something barebones out quickly to capture all of the great work being produced by the community.

Anyone interested in sharing their Enyo components, samples, etc. are encouraged to follow these instructions for getting their components showcased in the gallery.

### Directions for Adding Components to Gallery ###

The gallery is a simple Enyo app hosted from our github repo.  To register a new component, please follow these instructions:

1. Fork the github repo (`git@github.com:enyojs/gallery.git`)
2. Edit the gallery_manifest.json file to add author and component info (see below)
3. If you want, add a line to the noscript part of index.html for your component.
4. Add a 200 x 200 px image/screenshot for your component to the gallery_images directory.
   It should be JPEG and named with your component's unique component ID, e.g. `me.awesomecontrol.jpg`.
5. Commit your changes to your fork
6. Submit a github pull request to the `gh-pages` branch of `enyojs/gallery`

The format of gallery_manifest.json is as follows:

	"owners": {						// List of authors, referenced by component descriptions
		"xxxx": {					// Author id (github username)
			"name": "",				// Display name for author
			"website": "",			// Author's website
			"twitter": ""			// Author's twitter handle
		},
		...
	}
    "widgets": [					// The list of components in the gallery
        {
            "name": "",				// Unique component id (owner.component)
            "displayName": "",		// Display name for component
            "owner": "xxxx",		// Author id, from above
            "dependencies": [		// List of libraries this component requires
                {
                    "name": "",		// Name of dependency
                    "version": ""	// Version of dependency
                },
                ...
            ],
            "url": "",				// URL to source code (i.e. github link)
            "demoUrl": "",			// URL to demo website (optional)
			"submissionDate": "",	// Date of submission (i.e. "Mar 26, 2012")
			"testedPlatforms": "",	// List of platforms this component was tested on
            "license": "",			// Reference to standard license (i.e. "Apache 2.0" or license text)
            "version": "1",			// Version of this component (optional)
            "blurb": ""				// Description of component
        },
        ...
	]


Please note the following:

* We will only accept pull requests to the catalog for OSS-licensed components from the original author.  If you have forked another members' component, please submit a separate, new component.
* There should be one unique "owner" entry per author.  For the owner id, please use your github username.  You may choose your full name or username as the display name.
* The "website", "twitter", and "demoUrl" fields are optional and may be omitted if you wish.  
* The "testedPlatforms" field should list the platforms you have tested your component on (i.e. "iOS 5.1", "Chrome 18", "IE9").
* The "license" field should either reference a standard OSS license (i.e. "Apache 2.0") or include the text of your license.
* The "dependencies" field should list any other Enyo libraries your component requires (i.e. onyx, layout).
* The "version" field for dependencies is optional but will be displayed if present.
* You may include a "version" for your component, however we are not yet using this on the site.
* New entries in the index.html file should follow the format having a link to the gallery entry and the control name.
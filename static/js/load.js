// Selectors

var SELECTOR_CATEGORIES = '#categories';
var SELECTOR_ENTITIES = '#entities';
var ITEM_CSS_CLASS = 'callout';

var tagcloud = function(dom,tag) {
    if (dom === null) {
        return
    }
    var highVal = 0;
    var lowVal = Number.MAX_VALUE;
    var elements = dom.getElementsByTagName(tag);
    var minFont = parseInt(dom.getAttribute('data-minfont'),10);
    var maxFont = parseInt(dom.getAttribute('data-maxfont'),10);
    var fontDif = 0;
    var sizeDif = 0;
    var size = 0;
    var i = 0;
    var data = 0;

    for(i = 0; i < elements.length; ++i) {
        data = parseInt(elements[i].getAttribute('data-count'),10);
        if(data > highVal) {
            highVal = data;
        }
        if(data < lowVal) {
            lowVal = data;
        }
    }

    fontDif = maxFont - minFont;
    sizeDif = highVal - lowVal;

    for(i = 0; i < elements.length; ++i) {
        data = parseInt(elements[i].getAttribute('data-count'),10);
        size = (fontDif * (data - lowVal) / sizeDif) + minFont;
        size = Math.round(size);
        elements[i].style.fontSize = size + "px";
    }
}

var loadForCategory = function(responseJSON, category) {
    var getEntityId = function(name) {
        return 'entity_' + name;
    }

    var entitiesDiv = $('<div></div>');
    const entities = responseJSON['entities']
    const l = entities.length
    for (var i = 0; i < l; i++) {
        const categories = entities[i]['category']
        var categoryChosen = category === 'all'
        for (var j = 0; j < categories.length; j++) {
            if (categoryChosen) {
                break
            }
            if (category == categories[j]) {
                categoryChosen = true;
                break
            }
        }
        if (!categoryChosen) {
            continue
        }

        var div = $('<div></div>');
        var title = '<p class="title" id="' + getEntityId(entities[i]['name']) + '">' + entities[i]['name'] + ' '
        for (var j = 0; j < categories.length; j++) {
            title = title + '<span class="label">' + categories[j] + '</span> '
        }
        title = title + '</p>'
        div.html(title);
        div.append('<p>Related Keywords - </p>')
        var relatedDiv = $('<div id="related' + i + '" data-maxfont="24" data-minfont="12"></div>');
        words = []
        const nRelated =  entities[i]['entities'].length
        for (var j = 0; j < nRelated; j++) {
            const related = entities[i]['entities'][j]
            relatedDiv.append('<span class="label internal-link-label"  data-count=' + related[1] + '><a href="#' + getEntityId(related[0]) + '" class="no-decoration-internal-link">' + related[0] + '</a></span> ');
            //words.push({text: related[0], weight: related[1]});
        }
        div.append(relatedDiv)
        div.append('<p></p>')

        var titlesContainer = $(
                    '<ul class="accordion" data-accordion data-allow-all-closed="true">' +
                    '</ul>');
        var titlesItem = $(
                      '<li class="accordion-item" data-accordion-item="">' +
                        '<a href="#" class="accordion-title">Show Articles</a>' +
                      '</li>');
        var titles = $('<div class="accordion-content" data-tab-content="">' + '</div>');

        const ars =  entities[i]['articles'].length
        for (var j = 0; j < ars; j++) {
            const url = entities[i]['articles'][j]['url']
            const title = entities[i]['articles'][j]['title']
            const source = entities[i]['articles'][j]['source']
            titles.append(
                        '<blockquote>' +
                          '<p><a class="no-decoration-link" href="' + url + '">' + title + '</a>' +
                          '<span class="source"> - ' + source + '</span></p>' +
                        '</blockquote>'
                        );
        }

        titlesItem.append(titles)
        titlesContainer.append(titlesItem)
        div.append(titlesContainer)
        div.addClass(ITEM_CSS_CLASS);
        entitiesDiv.append(div);
    }

    $(SELECTOR_ENTITIES).empty()
    $(SELECTOR_ENTITIES).append(entitiesDiv)
    for (var i = 0; i < l; i++) {
        tagcloud(document.getElementById('related' + i),'span');
    }
    $(document).foundation()
}

var load = function(responseJSON) {
    var getToggleButtonId = function(i) {
        return 'r' + i.toString();
    }

	var getTagButtonHtml = function(id, label) {
		//return '<a class="button" id="' + id + '">' + label + '</a>'
		//return '<span class="label" id="' + id + '">' + label + '</span>';
		return '<li class="top-bar-menu-item"><a id="' + id + '">' + label + '</a></li>'
	}

    const allCategories = responseJSON['category']
    var categories = getTagButtonHtml(getToggleButtonId(0), 'all')
    for (var j = 1; j <= allCategories.length; j++) {
        categories = categories + getTagButtonHtml(getToggleButtonId(j), allCategories[j-1])
    }
    $(SELECTOR_CATEGORIES).append(categories);

    var addToggleButtonEventHandler = function(id, category) {
        $('#'+id).click(
            function(clicked){
                const categroy = clicked.currentTarget.text
                loadForCategory(responseJSON, categroy)
            });
    }
    addToggleButtonEventHandler(getToggleButtonId(0), 'all')
    for (var j = 1; j <= allCategories.length; j++) {
        addToggleButtonEventHandler(getToggleButtonId(j), allCategories[j-1])
    }

    loadForCategory(responseJSON, 'all')

    var tc = document.getElementById('tagcloud');
	tagcloud(tc,'span');
}

$('document').ready(function(){
    $(document).foundation()
    $('document').foundation()
    var res = $.ajax({
	    type: 'GET',
		url: '/feed',
		success: load,
	});
});


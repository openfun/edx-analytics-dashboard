define(function(require) {
    'use strict';

    var $ = require('jquery'),
        _ = require('underscore'),
        Marionette = require('marionette'),

        ActiveFiltersView,

        activeFiltersTemplate = require('text!components/generic-list/list/templates/active-filters.underscore');

    ActiveFiltersView = Marionette.ItemView.extend({
        events: {
            'click .action-clear-filter': 'clearOneFilter',
            'click .action-clear-all-filters': 'clearAllFilters'
        },

        template: _.template(activeFiltersTemplate),

        initialize: function(options) {
            this.options = options || {};
            if (this.options.mode === 'client') {
                this.listenTo(this.options.collection, 'backgrid:refresh', this.render);
            } else {
                this.listenTo(this.options.collection, 'sync', this.render);
            }
        },

        getFormattedActiveFilters: function(activeFilters) {
            return _.mapObject(activeFilters, _.bind(function(filterVal, filterKey) {
                var formattedFilterVal = (filterKey === 'text_search') ?
                    '"' + filterVal + '"' : filterVal.charAt(0).toUpperCase() + filterVal.slice(1),
                    filterDisplayName = this.options.collection.filterDisplayName(filterKey),
                    // Translators: this is a label describing a filter selection that the user initiated.
                    displayName = _.template(gettext('<%= filterDisplayName %>: <%= filterVal %>'))({
                        filterDisplayName: filterDisplayName,
                        filterVal: formattedFilterVal
                    });
                return {
                    displayName: filterDisplayName === '' ? formattedFilterVal : displayName
                };
            }, this));
        },

        templateHelpers: function() {
            // Note that search is included in 'activeFilters'
            var activeFilters = this.options.collection.getActiveFilterFields(true),
                hasActiveFilters = !_.isEmpty(activeFilters);

            activeFilters = this.getFormattedActiveFilters(activeFilters);

            return {
                hasActiveFilters: hasActiveFilters,
                activeFilters: activeFilters,
                activeFiltersTitle: gettext('Filters In Use:'),
                removeFilterMessage: gettext('Click to remove this filter'),
                // Translators: "Clear" in this context means "remove all of the filters"
                clearFiltersMessage: gettext('Clear'),
                clearFiltersSrMessage: gettext('Click to remove all filters')
            };
        },

        clearOneFilter: function(event) {
            var filterKey;
            event.preventDefault();
            filterKey = $(event.currentTarget).data('filter-key');
            this.options.collection.clearFilter(filterKey);
            // Send a signal to the parent view (it bubbles up) so that other controls recieve the state update
            this.$el.trigger('clearFilter', filterKey);
        },

        clearAllFilters: function(event) {
            var filterKeys = this.options.collection.getActiveFilterFields(true);
            event.preventDefault();
            this.options.collection.clearAllFilters();
            // Send a signal to the parent view (it bubbles up) so that other controls recieve the state update
            this.$el.trigger('clearAllFilters', filterKeys);
        }
    });

    return ActiveFiltersView;
});

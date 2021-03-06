# ESN modules

This document describes and lists all anchor points available inside the ESN. Note that for better display, one should
follow the template example pattern.

## Anchor points list

### domainUserRightDropdown

#### Template example

        li: a(href='#/applications') #{__('Applications')}

### domainHeaderNavBar

#### Template example

        .esn-item(data-esn-path='projects')
          span
            a(href='#/projects')
              i.fa.fa-suitcase
              span.hidden-xs #{__('Projects')}

### communityPageRightPanel

#### Template example

        .esn-panel
          div
            ...
        .vertiz-space

### communityPageActionsToolbar

#### Template example

        &nbsp;
        a.btn.btn-info(ng-href='/#/appstore/communities/{{community._id}}/apps')
          | #{__('App store')} &nbsp;
          i.fa.fa-cubes

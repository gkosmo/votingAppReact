import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { autobind } from 'core-decorators';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import Random from 'meteor/random';
import Item from './Item';
import IsRole from './utilities/IsRole';
import Voted from './utilities/Voted';

import Votes from '../api/Votes';
import Items from '../api/Items';

@autobind
class Search extends Component {
  search (event) {
      event.preventDefault();
    const search = this.refs.search.value.trim();
      Session.set('searchValue', search);
  }
  voted(itemId){
      return this.props.votes.includes(itemId);
  }

  render() {
    if (!this.props.ready) {
        return <div>Loading</div>;
    }
    return (
      <main>

        <form className='search-items' onSubmit={this.search}>
          <input type='text' ref='search' />
          <button type='submit'>search Items</button>
        </form>


        <ReactCSSTransitionGroup
          transitionName='item'
          transitionEnterTimeout={600}
          transitionLeaveTimeout={600}
          transitionAppear={true}
          transitionAppearTimeout={600}>
          {this.props.items.map((item) => {
            if(this.voted(item._id)) {
             return( <div>
                <Item item={item} voted={true} key={item._id}/>
            </div> );
            } else {
              return( <div>
                <Item item={item} voted={false} key={item._id}/>
            </div> );
            }


          })}
        </ReactCSSTransitionGroup>
      </main>
    );
  }
}

export default createContainer(({params}) => {
 let itemsSub;
  if( Session.get("searchValue")) {
    console.log('sesibn get value');
       itemsSub = Meteor.subscribe('searchItems', Session.get('searchValue'));
    itemsArray = Items.find({}, {
          limit:  50,
          sort: { lastUpdated: 1 }
        }).fetch()
     console.log(itemsArray);
    } else {
      console.log('otehrs')
    itemsSub = Meteor.subscribe('searchItems');

    }
 let searchValue = Session.get("searchValue");
  let userSub = Meteor.subscribe('currentUser');
  let votesSub = Meteor.subscribe('allVotes');
  let itemsArray;
  itemsArray = Items.find({}, {
          limit:  50,
          sort: { lastUpdated: 1 }
        }).fetch()

  let votesArray = [];

  if( votesSub.ready()){
    votesArray = Votes.find({}).fetch();
    votesArray = votesArray[0];
    votesArray = votesArray.votes;
  }
  return {

    searchValue,
    ready: itemsSub.ready() && userSub.ready() && votesSub.ready(),
    items: itemsArray,
    votes: votesArray
  }
}, Search);

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
class App extends Component {
  addItems(event) {
    event.preventDefault();
    const itemOne = this.refs.itemOne.value.trim();
    const itemTwo = this.refs.itemTwo.value.trim();
    if (itemOne !== '' && itemTwo !== '') {
      Meteor.call('insertNewItem', itemOne, itemTwo, (err, res) => {
        if(!err) {
          this.refs.itemOne.value = '';
          this.refs.itemTwo.value = '';
        }
      });
    }
  }

  showAll() {
    if(this.props.showAll) {
      Session.set('showAll', false);
    } else {
      Session.set('showAll', true);
    }
  }
  voted(itemId){
      return this.props.votes.includes(itemId);
  }
  randomItem(event){
    if(this.props.testRandom) {
          Session.set('randomTest', false);
        } else {
          Session.set('randomTest', true);
        }
      console.log(this.props.items);
 }

  render() {
    if (!this.props.ready) {
        return <div>Loading</div>;
    }
    const test = true;
    return (
      <main>
        <IsRole role='admin' {...this.props}>
          <button onClick={this.showAll}>
            Show {this.props.showAll ? 'One' : 'All'}
          </button>
        </IsRole>
        {test &&
          <div>i'm inline conditional</div>
        }
        {test ? <div>i'm inline conditional</div> : <div>Not allowed</div>}
        <form className='new-items' onSubmit={this.addItems}>
          <input type='text' ref='itemOne' />
          <input type='text' ref='itemTwo'/>
          <button type='submit'>Add Items</button>
        </form>
        <div className="jumbotron">

          </div>
          <button onClick={this.randomItem}>  Random </button>
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
  let itemsSub = Meteor.subscribe('allItems');
  let userSub = Meteor.subscribe('currentUser');
  let showAll = Session.get('showAll');
  let votesSub = Meteor.subscribe('allVotes');
  let itemsArray;
  let testRandom = Session.get('randomTest');
  if(testRandom) {
      itemsArray = Items.find({}, {
        limit:  50,
      }).fetch();
        console.log(itemsArray);
         let itemsCount = itemsArray.length;
         let itemIndex = Math.floor( Math.random() * itemsCount);
         console.log(itemIndex);

          itemsArray= [ itemsArray[itemIndex]];
         console.log(itemsArray);
    console.log('in testRandom');
    } else {
    if (params.id) {
      itemsArray = Items.find({_id: params.id}).fetch();
    } else {
      console.log('not params');
        itemsArray = Items.find({}, {
          limit: showAll ? 50 : 1,
          sort: { lastUpdated: 1 }
        }).fetch()
      }
  }
    let votesArray = [];

  if( votesSub.ready()){
    votesArray = Votes.find({}).fetch();
  votesArray = votesArray[0];
  votesArray = votesArray.votes;
  }
  return {
    testRandom,
    showAll,
    ready: itemsSub.ready() && userSub.ready() && votesSub.ready(),
    items: itemsArray,
    votes: votesArray
  }
}, App);

import { Mongo } from 'meteor/mongo';
import 'babel-polyfill';
import SimpleSchema from 'simpl-schema';
import Votes from './Votes';
const Items = new Mongo.Collection('items');

const ItemSchema = new SimpleSchema({
  text: String,
  value: SimpleSchema.Integer,
});

const ItemsSchema = new SimpleSchema({
  itemOne: ItemSchema,
  itemTwo: ItemSchema,
  lastUpdated: {
    type: Date,
    optional: true
  }
});

Items.attachSchema(ItemsSchema);



if (Meteor.isServer) {

  Meteor.publish('allItems', function() {
    return Items.find({}, {
      limit: 50,
      sort: { lastUpdated: 1 }
    });
  });


  Meteor.methods({
    insertNewItem(itemOne, itemTwo) {
     if(Meteor.userId()) {
      Items.insert({
        itemOne: {
          text: itemOne,
          value: 0,
        },
        itemTwo: {
          text: itemTwo,
          value: 0,
        }
      });
      Roles.addUsersToRoles(Meteor.userId(), 'submitter');

  }

    },

    voteOnItem(item, position) {
      check(item, Object);
      let lastUpdated = new Date();
      if(Meteor.userId()) {
        if(position === 'itemOne') {
          Items.update(item._id, {
            $inc: {
              'itemOne.value': 1
            },
            $set: {
              lastUpdated
            }
          })
        } else {
          Items.update(item._id, {
            $inc: {
              'itemTwo.value': 1
            },
            $set: {
              lastUpdated
            }
          })

        }
        Meteor.call('voteOnVote', item._id);
        Roles.addUsersToRoles(Meteor.userId(), 'voter');
      }
    }
  });
}



export default Items;

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
  Items._ensureIndex({
    "itemOne.text": "text",
    "itemTwo.text": "text",
  });
  Meteor.publish("searchItems", function(searchValue) {
  if (!searchValue || searchValue.length == 0) {
    return Items.find({});
  }
    searchValue = new RegExp( searchValue, 'i' );

  return Items.find(
    {  $or: [
      {"itemOne.text": {$regex: searchValue}},
      {"itemTwo.text": {$regex: searchValue}}
      ]
    },
    {
      // `fields` is where we can add MongoDB projections. Here we're causing
      // each document published to include a property named `score`, which
      // contains the document's search rank, a numerical value, with more
      // relevant documents having a higher score.
      // fields: {
      //   score: { $meta: "textScore" }
      // },
      // // This indicates that we wish the publication to be sorted by the
      // `score` property specified in the projection fields above.
      // sort: {
      //   score: { $meta: "textScore" }
      // }
    }
  );
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

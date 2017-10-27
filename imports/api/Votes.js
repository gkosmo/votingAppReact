import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import 'babel-polyfill';
const Votes = new Mongo.Collection('Votes');


const VotesSchema = new SimpleSchema({
  userId: String,
  votes: [String],
  lastUpdated: {
    type: Date,
    optional: true
  }
});

Votes.attachSchema(VotesSchema);



if (Meteor.isServer) {

  Meteor.publish('allVotes', function() {
    return Votes.find({userId: Meteor.userId()}, {});
  });


  Meteor.methods({
    insertNewVote(userId) {
       Votes.insert({
        userId: userId,
        votes: []
      });
    },

    voteOnVote(ItemId) {
      check(ItemId, String);
      let lastUpdated = new Date();
      if(Meteor.userId()) {
        console.log(ItemId);
         Votes.update({userId: Meteor.userId()}, {
            $push: {'votes':  ItemId }  ,
            $set: {
              lastUpdated
            }
          });
        }
      }
  });
}



export default Votes;

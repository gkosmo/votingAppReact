import Votes from './../api/Votes';

Accounts.onCreateUser((options, user) => {
  if (Meteor.users.find({}).fetch().length == 0 ) {
    user.roles = ['admin'];
  }
  Meteor.call('insertNewVote', user._id)
  return user;
});

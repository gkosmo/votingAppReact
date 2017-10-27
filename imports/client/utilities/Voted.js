import React, { PropTypes } from 'react';

const Voted = ({itemId, votes, children}) => {
   if(votes.includes(itemId)) {
    return ;
   }
}

export default Voted;

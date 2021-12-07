import React from 'react';
import { connect } from 'react-redux';
import { 
  SetupTimelockRender
} from './setupTimelock.render';

class SetupTimelock extends React.Component {
  constructor(props) {
    super(props);

    this.state = {}
  }

  render() {
    return SetupTimelockRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    mainPath: state.navigation.mainPath,
  };
};

export default connect(mapStateToProps)(SetupTimelock);
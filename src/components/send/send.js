import React from 'react';
import Input from 'react-toolbox/lib/input';
import { IconMenu, MenuItem } from 'react-toolbox/lib/menu';
import { fromRawLsk, toRawLsk } from '../../utils/lsk';
import SecondPassphraseInput from '../secondPassphraseInput';
import ActionBar from '../actionBar';

import styles from './send.css';

class Send extends React.Component {
  constructor() {
    super();
    this.state = {
      recipient: {
        value: '',
      },
      amount: {
        value: '',
      },
      secondPassphrase: {
        value: null,
      },
    };
    this.fee = 0.1;
    this.inputValidationRegexps = {
      recipient: /^\d{1,21}[L|l]$/,
      amount: /^\d+(\.\d{1,8})?$/,
    };
  }

  componentDidMount() {
    const newState = {
      recipient: {
        value: this.props.recipient || '',
      },
      amount: {
        value: this.props.amount || '',
      },
    };
    this.setState(newState);
  }

  handleChange(name, value) {
    this.setState({
      [name]: {
        value,
        error: this.validateInput(name, value),
      },
    });
  }

  setErrorAndValue(name, error, value) {
    this.setState({
      [name]: {
        value,
        error,
      },
    });
  }

  validateInput(name, value) {
    if (!value) {
      return 'Required';
    } else if (!value.match(this.inputValidationRegexps[name])) {
      return 'Invalid';
    } else if (name === 'amount' && value > parseFloat(this.getMaxAmount())) {
      return 'Insufficient funds';
    } else if (name === 'amount' && value === '0') {
      return 'Zero not allowed';
    }
    return undefined;
  }

  send() {
    this.props.sent({
      activePeer: this.props.activePeer,
      account: this.props.account,
      recipientId: this.state.recipient.value,
      amount: this.state.amount.value,
      passphrase: this.props.account.passphrase,
      secondPassphrase: this.state.secondPassphrase.value,
    });
  }

  getMaxAmount() {
    return fromRawLsk(Math.max(0, this.props.account.balance - toRawLsk(this.fee)));
  }

  setMaxAmount() {
    this.handleChange('amount', this.getMaxAmount());
  }

  render() {
    return (
      <div className={`${styles.send} send`}>
        <Input label='Recipient Address' required={true}
          className='recipient'
          autoFocus={true}
          error={this.state.recipient.error}
          value={this.state.recipient.value}
          onChange={this.handleChange.bind(this, 'recipient')} />
        <Input label='Transaction Amount' required={true}
          className='amount'
          error={this.state.amount.error}
          value={this.state.amount.value}
          onChange={this.handleChange.bind(this, 'amount')} />
        <SecondPassphraseInput
          error={this.state.secondPassphrase.error}
          value={this.state.secondPassphrase.value}
          onChange={this.handleChange.bind(this, 'secondPassphrase')}
          onError={this.setErrorAndValue.bind(this, 'secondPassphrase')} />
        <div className={styles.fee}> Fee: {this.fee} LSK</div>
        <IconMenu icon='more_vert' position='topRight' menuRipple className={`${styles.sendAllMenu} transaction-amount`} >
          <MenuItem onClick={this.setMaxAmount.bind(this)}
            caption='Set maximum amount'
            className='send-maximum-amount'/>
        </IconMenu>
        <ActionBar
          secondaryButton={{
            onClick: this.props.closeDialog,
          }}
          primaryButton={{
            label: 'Send',
            disabled: (
              !!this.state.recipient.error ||
              !!this.state.amount.error ||
              !!this.state.secondPassphrase.error ||
              this.state.secondPassphrase.value === '' ||
              !this.state.recipient.value ||
              !this.state.amount.value),
            onClick: this.send.bind(this),
          }} />
      </div>
    );
  }
}

export default Send;

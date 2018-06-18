import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, Input, List } from 'antd'
import { testnet, mainnet } from '../constants';
import { getList, write, getMine } from '../request';
import style from './index.less';
import { default as actions } from '../actions';

const confirm = Modal.confirm;

function showConfirm(cb) {
  confirm({
    title: '你想把分数记录到区块链上么？',
    content: '记录到区块链上可以永久保存你的分数',
    onOk: cb,
    onCancel: () => {},
  });
}

class DappContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSaveScoreModal: false,
      name: '',
      dappRank: []
    }
    this.t = 0;
  }

  componentDidMount() {
    setTimeout(() => {
      this.t = 1;
    }, 2000)
    this.getList()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.reset && !this.props.reset && this.t === 1) {
      showConfirm(this.onOk)
    }
  }

  onOk = () => {
    this.props.dispatch(actions.lock(true))
    this.setState({ showSaveScoreModal: true })
  }

  write = async (name, score) => {
    const res = await write(testnet, name, score)
    console.log(res)
    return res;
  }

  getList = async () => {
    try {
      const res = await getList(testnet)
      this.setState({ dappRank: res.records })
    } catch (e) {
      this.setState({ error: e })
    }
  }

  getMine = async (address) => {
    try {
      const res = await getMine(testnet, address)
      console.log(res)
    } catch (e) {
      this.setState({ error: e })
    }
  }

  onChangeName = e => {
    this.setState({ name: e.target.value })
  }

  handleCancel = () => {
    this.setState({ showSaveScoreModal: false, name: '' })
    this.props.dispatch(actions.lock(false))
  }

  handleRecordChain = () => {
    if (this.state.name === '') {
      alert('请输入名字!')
      return
    }
    this.write(this.state.name, this.props.score)
    this.setState({ showSaveScoreModal: false, name: '' })
    this.props.dispatch(actions.lock(false))
  }

  render() {
    return (
      <div className={style.dapp}>
        <Modal
          title="保存到星云链"
          visible={this.state.showSaveScoreModal}
          onOk={this.handleRecordChain}
          onCancel={this.handleCancel}
        >
          <Input
            placeholder="你的名字"
            value={this.state.name}
            onChange={this.onChangeName}
          />
        </Modal>
        <List
          bordered
          header={'分数排行榜'}
          itemLayout={'horizontal'}
          dataSource={this.state.dappRank}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={item.name + " - " + item.score + " 分"}
                description={item.address}
              />
            </List.Item>
          )}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    reset: state.get('reset'),
    score: state.get('points')
  }
}

const mapDispatchToProps = dispatch => {
  return { dispatch }
}

export default connect(mapStateToProps, mapDispatchToProps)(DappContainer);

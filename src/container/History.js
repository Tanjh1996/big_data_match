import React, {Component} from 'react'
import {Tabs, Button, Input, Table,Modal} from 'antd';
import './History.css';
import {connect} from 'react-redux';
import {setHistory} from '../actions/index';
import {api} from '../const'
const TabPane = Tabs.TabPane;
const columns = [
    {
        title: '问题',
        dataIndex: 'question',
        key: 'question'
    }, {
        title: '时间',
        dataIndex: 'time',
        key: 'time'
    }
];
class History extends Component {
    state = {
        questions: [],
        hot: []
    }
    ask = (question) => () => {
        fetch(`${api}/GetSimi`, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify({question,age:20,sex:'男'}),
              mode: 'cors'
            }).then(res => res.json()).then(data => Modal.info({content:data.HD,title:'回答'})).catch(e => console.log(e))
    }
    componentDidMount = () => {
        
        this
            .props
            .setHistory('history');
        fetch(`/history/get?user=${this.props.user === '游客'
            ? window.localStorage.getItem('user')
            : this.props.user}`)
            .then(res => res.json())
            .then(data => {
                this.setState({questions: data.result})
            })
            .catch(e => console.log(e));
            if (window.localStorage.getItem('redian') == null){
                fetch(`${api}/GetRedian`)
                .then(res => res.json())
                .then(data => {
                    window.localStorage.setItem("redian",JSON.stringify(data));
                    this.setState({
                        hot: Object
                            .keys(data)
                            .map((item,key) =><li className='history_redian' onClick={this.ask(data[item])}>{key +1}、{data[item]}</li>)
                    })
                })
                .catch(e => console.log(e));
            }else{
               const  tempdata = JSON.parse(window.localStorage.getItem("redian"))
               this.setState({
                hot: Object
                    .keys(tempdata)
                    .map((item,key) =><li className='history_redian' onClick={this.ask(tempdata[item])}>{key +1}、{tempdata[item]}</li>)
            })
            }

    }

    render() {
        const {questions,hot} = this.state;
        console.log(questions)
        const tabledata = questions.map((item,key) => {
            return {
                question: item.question,
                time: new Date(Number(item.time)).toLocaleString(),
                answer: item.answer || '小邮回答不了',
                key,
                timestamp:item.time
            }
        });
        tabledata.sort((a,b) => b.timestamp - a.timestamp);
        return (
            <div className='history_container'>
                <h2>热门问题：</h2>
                <ul>{hot.slice(0,5)}</ul>
                <h2 style={{
                    margin: '10px 0 10px'
                }}>历史提问：</h2>
                <Table columns={columns} dataSource={tabledata} expandedRowRender={record => <p>回答：{record.answer}</p>}/>
                <Button type='primary' onClick={() => this.props.router.push('/info')}>发起新问题</Button>
            </div>
        )
    }
}
const mapStateToProps = (state, ownProps) => {
    return {user: state.user.user}
}
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        setHistory: (history) => {
            dispatch(setHistory(history))
        }
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(History)
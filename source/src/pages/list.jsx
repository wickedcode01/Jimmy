import React, { Component } from 'react'
import { List } from 'antd';
import './list.less'
export default class list extends Component {
    constructor(){
        super();
        this.state = {lists:[]}
        const script = document.createElement('script');
        script.src = './list.js';
        document.body.append(script);
        script.onload = () =>{
            this.setState({lists: window.lists || []})
        }
    }
    render() {

        return (
            <div className="list">
                <List
                    itemLayout="vertical"
                    size="large"
                    style={{ cursor: 'pointer' }}
                    dataSource={this.state.lists.reverse()}
                    renderItem={item => (
                        <List.Item
                            key={item.id}
                            onClick={() => {
                                this.props.history.push({ pathname: '/detail/' + item.id })
                            }}
                            actions={[
                            ]}
                        >
                            <List.Item.Meta
                                title={item.title}
                                description={item.brief}
                            />
                            {item.content}
                        </List.Item>
                    )}
                />

            </div>
        )
    }
}

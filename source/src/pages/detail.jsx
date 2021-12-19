import React, { Component } from 'react'
import { Typography, Divider } from 'antd';
import ReactMarkdown from 'react-markdown'
import './detail.less'
const { Title, Paragraph, Text, Link } = Typography;
export default class detail extends Component {
    constructor(){
        super();
        this.state = {article:{}}
        const script = document.createElement('script');
        script.src = './article.js';
        document.body.append(script);
        script.onload = () =>{
            const articles = window.articles || {};
            const id = this.props.match.params.articleId;
            this.setState({article:articles[id] })
        }
    }
    render() {
        const article = this.state.article || {};
        return (
            <div className='detail'>
                <Typography>
                <Title>{article.title}</Title>
                <Divider />
                <Paragraph><ReactMarkdown>{article.content}</ReactMarkdown></Paragraph>
            </Typography>
            </div>

        )
    }
}

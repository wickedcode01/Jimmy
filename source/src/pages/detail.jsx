import React, { Component } from 'react'
import { Typography, Divider,Skeleton } from 'antd';
import ReactMarkdown from 'react-markdown'
import './detail.less'
const { Title, Paragraph } = Typography;
export default class detail extends Component {
    constructor() {
        super();
        this.state = { article: {}, loading: true }
        const script = document.createElement('script');
        script.src = './article.js';
        document.body.append(script);
        script.onload = () => {
            const articles = window.articles || {};
            const id = this.props.match.params.articleId;
            this.setState({ article: articles[id], loading: false })
        }
    }
    render() {
        const article = this.state.article || {};
        return (
            <div className='detail'>
                <Skeleton loading={this.state.loading} active>
                    <Typography>
                        <Title>{article.title}</Title>
                        <Divider />
                        <Paragraph><ReactMarkdown className='paragraph'>{article.content}</ReactMarkdown></Paragraph>
                    </Typography>
                </Skeleton>

            </div>

        )
    }
}

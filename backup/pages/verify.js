import React from 'react'
import Layout from '../components/layout/layout'
import Tab1 from '../components/verify/tab1'
import Tab2 from '../components/verify/tab2'
import Tab3 from '../components/verify/tab3'
import axios from '../components/util/axios'
import getCookie from '../components/util/cookie'
import { Grid, Tab, Button } from 'semantic-ui-react'

const filterDocument = (doc, typeId) => {
  let documents = []
  doc.filter(({path, type_id: typeId, id}) => {
    documents[typeId - 1] = {
      id, path
    }
  })
  return documents
}

const Breadcrumb = () => <ol className='breadcrumb'>
  <li className='breadcrumb-item'><a href='/approve'>Approve System</a></li>
  <li className='breadcrumb-item active' aria-current='page'>Verify</li>
</ol>

class Verify extends React.Component {
  state = {
    profile: {
      profile_registrant: {
        activities: '',
        addr_dist: '',
        addr_prov: '',
        user_id: '',
        edu_name: ''
      }
    },
    documents: [],
    image: '',
    fblink: '',
    fileType: [],
    comment: '',
    question: 0
  }

  async componentDidMount () {
    let { token } = await getCookie({ req: false })
    let { data } = await axios.get(`/registrants/${this.props.url.query.user_id}`, {
      Authorization: `Bearer ${token}`
    })
    this.fetchData()
    await this.setState({ profile: data[0] })
    await this.setState({ documents: filterDocument(this.state.profile.documents) })
    await this.getFileType()
  }

  setComment = (comment) => {
    this.setState({
      comment
    })
  }

  async getFileType () {
    let fileType = []
    await this.state.documents.map(({path}, i) => {
      fileType[i] = path.substr(path.length - 3, path.length)
    })
    await this.setState({
      fileType: fileType
    })
  }

  async handleParentPermission (value, status) {
    let {token} = await getCookie({req: false})
    let headers = {
      Authorization: `Bearer ${token}`
    }
    await axios.put(`/documents/${this.state.documents[1].id}`, {
      isApprove: value,
      comment: this.state.comment
    }, headers)
    this.setState({ parentPermission: status, comment: '' })
  }

  async handleTransript (value, status) {
    let {token} = await getCookie({req: false})
    let headers = {
      Authorization: `Bearer ${token}`
    }
    await axios.put(`/documents/${this.state.documents[2].id}`, {
      isApprove: value,
      comment: this.state.comment
    }, headers)
    this.setState({ transcript: status, comment: '' })
  }

  async fetchData () {
    let { token } = await getCookie({ req: false })
    let { data: {data} } = await axios.get(`/users/${this.props.url.query.user_id}`, {
      Authorization: `Bearer ${token}`
    })
    let question = await axios.get(`/answers/${this.props.url.query.user_id}/count`, {
      Authorization: `Bearer ${token}`
    })
    this.setState({
      image: `https://graph.facebook.com/v2.12/${data.provider_acc}/picture?height=1000&width=1000`,
      question: question.data.data,
      fblink: `https://facebook.com/${data.provider_acc}`
    })
  }

  render () {
    const panes = [
      { menuItem: 'ข้อมูลน้อง',
        render: () => <Tab.Pane attached={false}>
          <Tab1
            question={this.state.question}
            fullName={`${this.state.profile.first_name} ${this.state.profile.last_name}`}
            image={this.state.image}
            info={this.state.profile}
            facebook={this.state.fblink}
          />
        </Tab.Pane> },
      { menuItem: 'ปพ.1',
        render: props => <Tab.Pane attached={false}>
          <Tab2
            question={this.state.question}
            fullName={`${this.state.profile.first_name} ${this.state.profile.last_name}`}
            comment={this.state.comment}
            setComment={this.setComment}
            fileType={this.state.fileType[2]}
            image={this.state.image}
            path={this.state.documents[2].path}
            info={this.state.profile}
            status={this.state.transcript}
            button={<ButtonTranscript />} />
        </Tab.Pane> },
      { menuItem: 'ใบอนุญาติ',
        render: props => <Tab.Pane attached={false}>
          <Tab3
            question={this.state.question}
            fullName={`${this.state.profile.first_name} ${this.state.profile.last_name}`}
            comment={this.state.comment}
            setComment={this.setComment}
            fileType={this.state.fileType[1]}
            image={this.state.image}
            path={this.state.documents[1].path}
            info={this.state.profile}
            status={this.state.parentPermission}
            button={<ButtonParentPermission />} />
        </Tab.Pane> }
    ]

    const ButtonParentPermission = () => (
      <Button.Group>
        {this.state.parentPermission === 'reject' ? <Button color='red' >Reject </Button> : <Button onClick={() =>
          this.handleParentPermission(0, 'reject')} >Reject </Button>}
        <Button.Or />
        {this.state.parentPermission === 'approve' ? <Button color='green' >Approved </Button> : <Button onClick={() => this.handleParentPermission(1, 'approve')}>Approved </Button>}
      </Button.Group>
    )

    const ButtonTranscript = () => (
      <Button.Group>
        {this.state.transcript === 'reject' ? <Button color='red' >Reject </Button> : <Button onClick={() => this.handleTransript(0, 'reject')} >Reject </Button>}
        <Button.Or />
        {this.state.transcript === 'approve' ? <Button color='green' >Approved </Button> : <Button onClick={() => this.handleTransript(1, 'approve')}>Approved </Button>}
      </Button.Group>
    )

    return (
      <Layout subheadertext={<Breadcrumb />}>
        <Grid.Row>
          <Tab className='col-12' menu={{ pointing: true }} panes={panes} />
        </Grid.Row>
      </Layout>
    )
  }
}

export default Verify

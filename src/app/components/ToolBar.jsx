var React = require('react');
var cx = require('classnames');
var LoadStates = require("../constants/LoadStates.js");
var BreedStore = require('../stores/BreedStore');
var BlueprintStore = require('../stores/BlueprintStore');

var ToolBar = React.createClass({

  contextTypes: {
    router: React.PropTypes.func
  },
  clearStates: {
    toolbarState: '',
    buttonLoadsate: '',
    newArtefact: '',
    errorMessage: '',
  },

  getInitialState: function(){
    return {
      toolbarState: '',
      buttonLoadsate: '',
      newArtefact: '',
      errorMessage: ''
    };
  },
  componentDidMount: function(){
    this._initArtefactFunctions();
  },
  componentWillUnmount: function(){
    this._destroyArtefactFunctions();
  },
  componentWillReceiveProps: function(nextProps) {
    console.log('%c will receive props ', 'background-color: green; color: white;', nextProps.requestResolved);
    if(nextProps.requestResolved){
      this.handleCancel();
    }
  },
  
  handleChange: function() {
    this.props.onUserInput(
        this.refs.filterTextInput.getDOMNode().value
    );
  },
  handleClick: function(viewType){
    this.props.handleViewSwitch(viewType);
  },
  handleAdd: function(e){
    this.setState({ toolbarState: 'expanded' });
    React.findDOMNode(this.refs.inputfield).focus();
  },

  handleUpload: function(e){
    var self = this;
    var reader = new FileReader();
    var file = e.target.files[0];

    reader.onload = function(upload) {
      self.setState({
        newArtefact: upload.target.result,
      });
    }
    reader.readAsText(file);
  },
  handleCancel: function(e){
    React.findDOMNode(this.refs.AddNewForm).reset();    
    this.setState(this.clearStates);
  },
  handleTextareaChange: function(e){
    this.setState({newArtefact: e.target.value});
  },
  handleSubmit: function(e){
    e.preventDefault();

    console.log(this.state);
    this.setState({ 
      errorMessage: '',
      buttonLoadsate: 'active'
    });
    this.props.handleAdd(this.state.newArtefact);
  },

  render: function() {

    // Set dynamic classes for elements
    var toolbarClasses = cx('toolbar', this.state.toolbarState);
    var addButtonClasses = cx({
      'button': true,
      'button-pink': true,
      'add-button': true,
      'hidden': this.props.addArtefactType == undefined ? true : false
    })
    var dialogClasses = cx({
      'dialog': true,
      'dialog-danger': true,
      'dialog-empty': this.state.errorMessage == '' ? true : false
    });
    var saveButtonClasses = cx({
      "active": this.props.loadState == LoadStates.STATE_LOADING,
      "button": true,
      "button-pink": true,
      "save-button": true
    });

    return (
      <section id="toolbar" className={toolbarClasses}>
        <div className='filtering-tools-box'>
          <button className="view-switch hidden" onClick={this.handleClick.bind(this,'general-list')}><img src="/images/unordered-list.svg" alt="list icon" width="20px" height="20px" /></button>
          <button className="view-switch hidden" onClick={this.handleClick.bind(this,'card-list')}><img src="/images/grid-large.svg" alt="card icon" width="20px" height="20px" /></button>
          <form className="search-form" onSubmit={this.handleSubmit}>
            <label htmlFor="searchfield">
              <img src="/images/search.svg" alt="search icon" width="16px" height="16px" className="search-icon" />
              <input id="searchfield" 
                type="search" 
                placeholder="Search" 
                name="searchfield" 
                value={this.props.filterText}
                ref="filterTextInput"
                onChange={this.handleChange} />
            </label>
          </form>
          <button className={addButtonClasses} onClick={this.handleAdd}>Add new</button>
        </div>

        <form className='add-artefact-box' onSubmit={this.handleSubmit} ref='AddNewForm'>
            <h2>Adding a new {this.props.addArtefactType}</h2>
            <p>Type or paste the contents of your {this.props.addArtefactType}, or upload a YAML file and edit its contents.</p>
            <div className='actions'>
              <button className="button button-ghost cancel-button" onClick={this.handleCancel}>Cancel</button>
              <span className='button button-ghost upload-button'> 
                Upload file<input type='file' onChange={this.handleUpload} />
              </span>
              <input type='submit' className={saveButtonClasses} value='Save' />
            </div>
            <p className={dialogClasses}>{this.state.errorMessage}</p>
            <textarea className='inputfield' ref="inputfield" value={this.state.newArtefact} onChange={this.handleTextareaChange}></textarea>
        </form>

      </section>
  )},

  _onChange: function() {
    var errorMessage = this._getErrorMessage();
    if(errorMessage)
      this.setState({ errorMessage: errorMessage });
  },

  _initArtefactFunctions: function(){
    if(this.props.addArtefactType == 'breed')
      BreedStore.addChangeListener(this._onChange);
    
    if(this.props.addArtefactType == 'blueprint')
      BlueprintStore.addChangeListener(this._onChange);
  },
  _destroyArtefactFunctions: function(){
    if(this.props.addArtefactType == 'breed')
      BreedStore.removeChangeListener(this._onChange);
    
    if(this.props.addArtefactType == 'blueprint')
      BlueprintStore.removeChangeListener(this._onChange);
    
  },
  _getErrorMessage: function(){
    if(this.props.addArtefactType == 'breed')
      return BreedStore.getError();
    
    if(this.props.addArtefactType == 'blueprint')
      return BlueprintStore.getError();
  }
});
 
module.exports = ToolBar;
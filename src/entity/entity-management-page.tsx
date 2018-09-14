import React, { Component } from 'react';
import  ViewAllEntities  from "./view-all-entities";
import NewEntity from "./new-entity";
import { connect } from 'react-redux';
import { Loader, Button, Dimmer, Message, Modal, Header, Icon } from "semantic-ui-react";
import { Entity } from "./entity-reducer";
import {DELETE_ALL_ENTITIES, DELETE_ENTITY, FETCH_ENTITIES, POST_ENTITY, PUT_ENTITY} from "./entity-actions";
import EntityImport from "./entity-import";
import DeleteEntitiesModal from "./delete-entities-modal";

interface DispatchProps {
    fetchEntities: () => void
    postEntity: (entity: Entity) => void,
    deleteEntity: (entityId: string) => void,
    putEntity: (entity: Entity, entityId: string) => void,
    deleteAllEntities: (entity: Entity[]) => void
}

interface StateProps {
    entities: Entity[]
    isFetching: boolean
}

interface State {
    showForm: boolean,
    openModal: boolean,
    importModal: boolean,
    selectedEntity?: Entity
}

type Props = DispatchProps & StateProps

class EntityManagementPage extends Component<Props, State> {

    state = {
        showForm: false,
        openModal: false,
        importModal: false,
        selectedEntity: null
    };

    componentDidMount() {
        this.props.fetchEntities();
    };

    render() {
        const { isFetching, entities } = this.props;
        const { showForm, openModal, importModal, selectedEntity } = this.state;

        if (isFetching) {
            return (
                <div className="loader-full-screen">
                    <Dimmer active={isFetching}>
                        <Loader size="big" />
                    </Dimmer>
                </div>
            )
        }

        if (!showForm && !importModal && !isFetching && entities && entities.length === 0) {
            return (
                <div className="text-content-center">
                    <Message
                        header='You have no entities yet'
                        content='When you add entities to your company, they will appear here. Entities available here are only for a specific company determined by the selected client.'
                    />
                    <div className='text-center'>
                        <Button primary basic onClick={this.addAnotherClicked}>
                            <i className="plus icon"/>
                            New Entity
                        </Button>
                        <Button secondary basic onClick={this.openImportEntitiesForm}>
                            <Icon name="upload"/>
                            Import Entities
                        </Button>
                    </div>
                </div>
            )
        }

        return (
            <div className='width-limit-small'>
                {
                    showForm ?
                        <div className='text-center block-m'>
                            <h2 className="text-center block-s">Add entities</h2>

                            <p className="text-content">
                                Register all your entities here, and you'll be able to
                                get entity specific IFRS-2 and social security reports.
                            </p>
                        </div>
                        :
                        <div className='width-limit block-s'>
                            <h2 className="text-center">Entities</h2>
                        </div>
                }
                {
                    entities && entities.length > 0  && !showForm ?
                        <div className='form-greyscale'>
                            <div className='flex-row align-center flex-end block-xs'>
                                <Button primary basic onClick={this.addAnotherClicked}>
                                    <i className="plus icon" />
                                    Add another entity
                                </Button>
                                <Button secondary basic onClick={this.openImportEntitiesForm}>
                                    <Icon name="upload"/>
                                    Import Entities
                                </Button>
                            </div>
                            <div>
                                <ViewAllEntities entities={entities} openModalClicked={this.openModalClicked} openEditFormClicked={this.openEditEntityForm}/>
                            </div>
                            <div className="text-center">
                                <Button basic color='red' onClick={this.openDeleteAllEntitiesClicked}>
                                    Delete All Entities
                                </Button>
                            </div>
                        </div>
                        :
                        <div>
                            {
                                !importModal &&
                                    <NewEntity postEntity={this.postNewEntity} closeFormClicked={this.closeFormClicked} selectedEntity={this.state.selectedEntity} editEntity={this.editEntity}/>
                            }
                        </div>
                }
                {
                    openModal &&
                        <DeleteEntitiesModal closeModal={() => this.setState({ openModal: false, selectedEntity: null })} open={openModal}
                                             selectedEntity={this.state.selectedEntity} deleteEntity={this.deleteEntity} deleteAllEntities={this.deleteAllEntities}/>
                }
                {
                    importModal &&
                        <Modal open={importModal}>
                            <i className="close icon" onClick={() => this.setState({ importModal: false })}/>
                            <div className='form-white'>
                                <div className='block-m'>
                                    <h2 className="text-center block-xs">Import Entities</h2>
                                    <p className="text-content">Import all entities for your client here...
                                    </p>
                                </div>
                                <div className='form-greyscale' style={{ borderRadius: 5 }}>
                                    <EntityImport closeImportEntitiesForm={this.closeImportEntitiesForm}/>
                                </div>
                            </div>
                        </Modal>
                }
            </div>
        )
    }

    private postNewEntity = (entity: Entity) => {
        this.props.postEntity(entity);
        this.setState({ showForm: false });
    };

    private addAnotherClicked = () => {
        this.setState({ showForm: true });
    };

    private closeFormClicked = () => {
        this.setState({ showForm: false, selectedEntity: null });
    };

    private openModalClicked = (entity: Entity) => {
        this.setState({ openModal: true, selectedEntity: entity });
    };

    private deleteEntity = () => {
        this.props.deleteEntity(this.state.selectedEntity.id);
        this.setState({ openModal: false });
    };

    private openImportEntitiesForm = () => {
        this.setState({ importModal: true });
    };

    private closeImportEntitiesForm = () => {
        this.setState({ importModal: false });
    };

    private openDeleteAllEntitiesClicked = () => {
        this.setState({ openModal: true });
    };

    private deleteAllEntities = () => {
        this.props.deleteAllEntities(this.props.entities);
        this.setState({ openModal: false });
    };

    private openEditEntityForm = (entity: Entity) => {
        this.setState({ showForm: true, selectedEntity: entity });
    };

    private editEntity = (entity: Entity) => {
        this.props.putEntity(entity, this.state.selectedEntity.id);
        this.setState({ selectedEntity: null, showForm: false });
    };
}

const mapStateToProps = (state): StateProps => {
    return({
        entities: state.entity.allEntities,
        isFetching: state.entity.isFetching
    })
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchEntities: () => dispatch ({ type: FETCH_ENTITIES }),
    postEntity: (entity: Entity) => dispatch ({ type: POST_ENTITY, entity }),
    deleteEntity: (entityId: string) => dispatch ({ type: DELETE_ENTITY, entityId }),
    putEntity: (entity: Entity, entityId: string) => dispatch ({ type: PUT_ENTITY, entity, entityId }),
    deleteAllEntities: (entities) => dispatch ({ type: DELETE_ALL_ENTITIES, entities })
});

const ConnectedComponent = connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(EntityManagementPage);

export default ConnectedComponent;

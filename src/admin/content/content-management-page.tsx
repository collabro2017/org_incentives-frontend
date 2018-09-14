import React, { Component } from 'react';
import { RootState } from "../../reducers/all-reducers";
import { connect, MapStateToProps } from "react-redux";
import { FETCH_CONTENTS, UPDATE_CONTENT } from "./content-actions";
import { Content } from "./content-reducer";
import SpinnerFullScreen from "../../common/components/spinner-full-screen";
import ContentMetadataPreview from "./content-metadata-preview";
import { match, Route, Switch } from "react-router";
import ContentEdit from "./content-edit";
import { ContentUpdateObject } from "./content-saga";

interface OwnProps {
    match: match<{}>,
}

interface StateProps {
    contents: Content[],
    isFetching: boolean,
}

interface DispatchProps {
    fetchContents: () => void,
    updateContent: (content_id: string, updateObject: ContentUpdateObject) => void
}

interface State {}

type Props = OwnProps & StateProps & DispatchProps;

class ContentManagementPage extends Component<Props, State> {
    componentDidMount() {
        this.props.fetchContents();
    }
    render() {
        if (this.props.isFetching) {
            return <SpinnerFullScreen active/>
        }

        return (
            <Switch>
                <Route path={`${this.props.match.path}/:content_id/edit`} render={({ match }) => (
                    <ContentEdit
                        {...this.selectedContentObject(match.params.content_id)}
                        save={this.props.updateContent.bind(this, match.params.content_id)}
                        backLink={this.props.match.path}
                    />
                )} />
                <Route
                    path={`${this.props.match.path}`}
                    render={({ match }) => (
                        <div>
                            {
                                this.props.contents.map((c) => <ContentMetadataPreview {...c} editLink={`${this.props.match.path}/${c.id}/edit`} key={c.id}/>)
                            }
                        </div>
                    )}
                />
            </Switch>
        );
    }

    private selectedContentObject = (content_id: string): Content => this.props.contents.filter((c) => c.id === content_id)[0]
}


const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state): StateProps => {
    return ({
        contents: state.content.allContents,
        isFetching: state.content.isFetchingContents,
    })
};

const mapDispatchToProps = (dispatch): DispatchProps => ({
    fetchContents: () => dispatch ({ type: FETCH_CONTENTS }),
    updateContent: (content_id: string, updateObject: ContentUpdateObject) => dispatch ({ type: UPDATE_CONTENT, content_id, updateObject }),
});

const ConnectedComponent = connect<StateProps, DispatchProps>(mapStateToProps,mapDispatchToProps)(ContentManagementPage);


export default ConnectedComponent;

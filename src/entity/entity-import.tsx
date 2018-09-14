import React, { Component } from "react";
import { SheetJSApp } from "../file-parse/sheetjs";
import { Button } from "semantic-ui-react";
import { connect, MapDispatchToProps } from "react-redux";
import EntitiesImportPreview from "./entity-import-preview";
import { Entity } from "./entity-reducer";
import { countryOptions } from "../data/common";
import { CREATE_ALL_ENTITIES } from "./entity-actions";
import { parseSocSec } from "../employees/employee-import";

export interface EntitySheetImport {
    name: string,
    identification: string,
    countryCode: string,
    soc_sec?: number
}

interface Props {
    closeImportEntitiesForm: () => void
}

interface State {
    entities: EntitySheetImport[],
    entitiesToBeCreated: Entity[]
    error?: string
}

interface DispatchProps {
    createEntities: (entities: Entity[]) => void
}

class EntityImport extends Component<Props & DispatchProps, State> {

    state = {
        entities: [],
        entitiesToBeCreated: [],
        error: null
    };

    render() {

        const { entities, error } = this.state;

        return (
            <div>
                <div className="block-xs">
                    <SheetJSApp handleData={this.handleData} />
                </div>
                {
                    error && <p>{error}</p>
                }
                {
                    entities.length > 0 &&
                    <EntitiesImportPreview entities={entities}/>
                }
                {
                    entities.length > 0 &&
                    <div className='text-center'>
                        <Button primary basic onClick={this.importEntities}>
                            Import Entities
                        </Button>
                    </div>
                }
            </div>
        )
    }

    private importEntities = () => {
        this.props.createEntities(this.state.entitiesToBeCreated);
        this.props.closeImportEntitiesForm();
    };

    private handleData = (data: Array<Array<string>>, cols: any) => {
        const [header, ...importData] = data;
        try {
            const entities: EntitySheetImport[] = importData.map(toEntitySheetImport);

            const entitiesToBeCreated: Entity[] = importData.map(toEntity);

            this.setState({ entities, entitiesToBeCreated, error: null });
        } catch (e) {
            this.setState({ error: e.message })
        }

    }
}

export const toEntitySheetImport = (entityLine): EntitySheetImport => {
    return {
        name: entityLine[0],
        identification: entityLine[1],
        countryCode: entityLine[2],
        soc_sec: parseSocSec(entityLine[3]),
    };
};

export const toEntity = (entityLine): Entity => {
    const entityName = entityNameValidation(entityLine[0]);
    const countryCode = countryCodeForCountryName(entityLine[2]);

    return {
        name: entityName,
        identification: entityLine[1],
        countryCode: countryCode,
        soc_sec: typeof parseSocSec(entityLine[3]) === "number" ? parseSocSec(entityLine[3]).toString() : null,
    };
};

const entityNameValidation = (entityName: string): string => {
    if (!entityName) {
        throw new Error(`Error parsing an empty entity name. Please provide the entity name.`)
    }

    return entityName;
};

const countryCodeForCountryName = (countryName: string): string => {
    const country = countryOptions.filter((c) => c.text === countryName)[0];

    if (!country) {
        throw new Error(`Error parsing country name: ${countryName}. It does not match any of stored countries.`)
    }

    return country.key;
};


const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (dispatch) => ({
    createEntities: (entities) => dispatch({ type: CREATE_ALL_ENTITIES, entities })
});

export default connect<null, DispatchProps>(null, mapDispatchToProps)(EntityImport);
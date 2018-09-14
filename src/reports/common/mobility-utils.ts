import {Moment} from "moment";
import {MobilityEntry} from "../../employees/employee-reducer";
import {Entity} from "../../entity/entity-reducer";


export const entityAtDate = (mobiltyEntries: MobilityEntry[], date: Moment): Entity => {
   const currentEntry = mobiltyEntries.find((me) => date.isBetween(me.from_date, me.to_date, null, "[]"));
   if (!currentEntry) {
       throw new Error("Could not find an entity.")
   }

   return currentEntry.entity
};
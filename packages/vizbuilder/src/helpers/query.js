import {joinDrilldownList} from "./sorting";

export function queryBuilder(query, params) {
  let i, item;

  item = params.measures.length;
  for (i = 0; i < item; i++) {
    query = query.measure(params.measures[i]);
  }

  item = params.drilldowns.length;
  for (i = 0; i < item; i++) {
    query = query.drilldown(...params.drilldowns[i]);
  }

  for (i = 0; i < params.cuts.length; i++) {
    item = params.cuts[i];
    if (typeof item !== "string") {
      item = item.values.map(v => `${item.key}.&[${v}]`).join(",");
      if (item.indexOf("],[") > -1) item = `{${item}}`;
    }
    query = query.cut(item);
  }

  item = params.filters.length;
  for (i = 0; i < item; i++) {
    query = query.filter(...params.filters[i]);
  }

  if (params.limit) {
    query = query.pagination(params.limit, params.offset);
  }

  if (params.order) {
    query = query.sorting(params.order, params.orderDesc);
  }

  for (item in params.options) {
    if (params.options.hasOwnProperty(item)) {
      query = query.option(item, params.options[item]);
    }
  }

  return query; // setLangCaptions(query, params.locale);
}

export function queryConverter(params) {
  return {
    measures: [params.measure.name],
    drilldowns: params.drilldowns.map(lvl =>
      lvl.fullName.slice(1, -1).split("].[")
    ),
    cuts: params.cuts,
    filters: params.filters,
    limit: undefined,
    offset: undefined,
    order: undefined,
    orderDesc: undefined,
    options: params.options,
    locale: "en"
  };
}

// function setCaptionForLevelAndLang(query, level, lang) {
//   const ann = level.annotations[`${lang}_caption`];
//   if (ann) {
//     query.caption(level.hierarchy.dimension.name, level.name, ann);
//   }
//   return query;
// }

// function setLangCaptions(query, lang) {
//   const drilldowns = query.getDrilldowns() || [];
//   drilldowns.forEach(level => {
//     query = setCaptionForLevelAndLang(query, level, lang);

//     // when parents requested, also get their i18n'd captions
//     if (query.options.parents) {
//       rangeRight(1, level.depth).forEach(d => {
//         const ancestor = level.hierarchy.levels.find(l => l.depth === d);
//         query = setCaptionForLevelAndLang(query, ancestor, lang);
//       });
//     }
//   });
//   return query;
// }

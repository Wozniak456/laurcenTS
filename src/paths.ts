const paths = {
    homePath(){
        return('/')
    },
    poolManaging(){
        return('/pool-managing/view')
    },
    batches(){
        return('/batches/view')
    },
    batchesItem(slug: string){
        return(`/batches/${slug}`)
    },
    weekSummary(){
        return('/summary-feeding-table/week')
    },
    daySummary(daySlug: string){
        return(`/summary-feeding-table/day/${daySlug}`)
    },
    goodsRegistering(){
        return('/purchtable/view')
    },
    realization(){
        return('/realization/headers/view')
    },
    accumulation(){
        return('/accumulation/view')
    },
    leftovers(){
        return('/leftovers/view')
    },
    determinedLeftovers(startDateSlug: string, endDateSlug: string){
        return(`/leftovers/${startDateSlug}_${endDateSlug}`)
    },
    generalSummary(){
        return('/general-summary/day-selection')
    },
    determinedGeneralSummary(daySlug: string){
        return(`/general-summary/${daySlug}`)
    }
}

export default paths
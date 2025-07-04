
export const STYLES = {
    map: {
        width: '100%',
        height: '95vh',
        position: 'relative'
    },
    mapInner: {
        width: '100%',
        height: '95vh',
        position: 'absolute',
        top: 0, left: 0
    },
    mapControls: {
        position: 'absolute',
        top: '20px', right: '20px',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column'
    },
    mapLoader: {
        position: 'absolute',
        top: '20px', left: '260px',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'row'
    },
    typeSelector: {
        position: 'absolute',
        top: '20px', left: '20px',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'row',
        // padding: '10px',
    },
    mapPopup: {
        position: 'fixed',
        bottom: '20px', right: '20px',
        // width: '50vw',
        // height:'200px',

        zIndex: 5,
        // display: 'flex',
        // flexDirection: 'column'
        // backgroundColor: 'white',
    },
    mapComment:{
        position: 'absolute',
        top: '20px', left: '20px',
        zIndex: 2,
    },
    mapCommentSpan:{
        fontSize: '1.5em',
        color: '#101070'
    },
    buttonsClass: 'f6 link dim br2 pv2 ph3 mb2 dib white bg-dark-blue'
}

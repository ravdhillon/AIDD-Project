import React from 'react';
import ImageSelector from '../ImageSelector/image-selector.js';

class PageContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            images: '',
            thumbnail: []
        }
    }
    render() {
        return(
            <div>
                <ImageSelector />
            </div>            
        )
    }
}

export default PageContainer;
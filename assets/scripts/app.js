class DOMHelper {
    static moveElement(elementId, destinationElementSelector){
        const element = document.getElementById(elementId);
        const destinationElement = document.querySelector(destinationElementSelector);
        destinationElement.append(element);
    }

    static clearEventListeners(element) {
        const clonedElement = element.cloneNode(true);
        element.replaceWith(clonedElement);
        return clonedElement;
    }
}

class Component {

    constructor(hostElementId, insertBefore = false){
        if(hostElementId){
            this.hostElement = document.getElementById(hostElementId);
        } else {
            this.hostElement = document.body;
        }
        this.insertBefore = insertBefore;
    }

    detach(){
        if(this.element){
            this.element.remove();
        //this.element.parentElement.removeChild(this.element);
        }
        
    }

    attach(){
        this.hostElement.insertAdjacentElement(
            this.insertBefore === true ? 'afterbegin' : 'beforeend', 
            this.element
        );
    }
}

class Tooltip extends Component {

    constructor(closeNotifierFunction){
        super();
        this.closeNotifier = closeNotifierFunction;
        this.create();
    }

    closeToolTip(){
        this.detach();
        this.closeNotifier();
    }

    create(){
        const toolTipElement = document.createElement('div');
        toolTipElement.className = 'card';
        toolTipElement.textContent = 'DUMMY!';
        toolTipElement.addEventListener('click', this.closeToolTip.bind(this));
        this.element = toolTipElement;
    }
    
}

class ProjectItem {
    hasToolTip = false;
    constructor(id, updateProjectListsFunction, type){
        this.type = type;
        this.id = id;
        this.updateProjectListsHandler = updateProjectListsFunction;
        this.connectMoreInfoButton();
        this.connectSwitchButton(type);
    }

    connectSwitchButton(type){
        const projectItemElement = document.getElementById(this.id);
        let switchButton = projectItemElement.querySelector('button:last-of-type');
        switchButton = DOMHelper.clearEventListeners(switchButton);
        switchButton.textContent = type === 'active' ? 'Finish' : 'Activate';
        switchButton.addEventListener('click', this.updateProjectListsHandler.bind(null, this.id));
    }

    moreInfoHandler(){
        if(this.hasToolTip){
            return;
        }
        const toolTip = new Tooltip(() => {
            this.hasToolTip = false
        });
        toolTip.attach();
        this.hasToolTip = true;
    }

    connectMoreInfoButton(){
        const projectItemElement = document.getElementById(this.id);
        const moreInfoButton = projectItemElement.querySelector('button:first-of-type');
        moreInfoButton.addEventListener('click', this.moreInfoHandler); 
    }
    update(updateProjectListsFn, type){
        this.updateProjectListsHandler = updateProjectListsFn;
        this.connectSwitchButton(type);
    }
}

class ProjectList {
    projects = [];
    constructor(type){
        this.type = type;
        const projItems = document.querySelectorAll(`#${type}-projects li`);
        for(const projItem of projItems){
            this.projects.push(new ProjectItem(projItem.id, this.switchProject.bind(this), this.type)); //This points to instance A.
        }
        console.log(this.projects);
    }

    setSwitchHandlerFunction(switchHandlerFunction){
        this.switchHandler = switchHandlerFunction;
    }

    //This function is called in another instance od the class
    addProject(project){
        this.projects.push(project);
        DOMHelper.moveElement(project.id, `#${this.type}-projects ul`);
        //Switching from instance A to instance B. The project now is instance B, so it needs to point to that instance.
        project.update(this.switchProject.bind(this), this.type);

    }

    switchProject(projectId){
        // const projectIndex = this.projects.findIndex(p => p.id === projectId);
        // this.projects.splice(projectIndex, 1);
        this.switchHandler(this.projects.find(p => p.id === projectId));
        this.projects = this.projects.filter(p => p.id !== projectId);
    }

}

class App {

    static init(){
        const activeProjectsList = new ProjectList('active');
        const finishedProjectsList = new ProjectList('finished');
        activeProjectsList.setSwitchHandlerFunction(finishedProjectsList.addProject.bind(finishedProjectsList));
        finishedProjectsList.setSwitchHandlerFunction(activeProjectsList.addProject.bind(activeProjectsList));
    }
}

App.init();
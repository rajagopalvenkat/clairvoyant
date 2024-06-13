import { DocsClass } from "@/app/components/docs/docsClass";
import { DocsContainer } from "@/app/components/docs/docsContainer";
import { DocsFunction } from "@/app/components/docs/docsFunction";
import { DocsInterface } from "@/app/components/docs/docsInterface";
import DocsProperty from "@/app/components/docs/docsProperty";
import DocsRef from "@/app/components/docs/docsReference";
import { DocsWarning } from "@/app/components/docs/docsSections";
import Header from "@/app/components/header";
import { ConstDocAny, ConstDocBoolean, ConstDocGenerator, ConstDocMap, ConstDocNumber, ConstDocRecord, ConstDocString, GenericDocType, IDocType, TupleArrayDocType, UnionDocType, docArrayOf, docMaybeUndefined } from "@/lib/docs/doclib";
export default function GraphSearchDocs() {
    return (
        <div>
            <Header selectedPage="graphsearch"></Header>
            <DocsContainer title={"Graph Search Documentation"}>
                <div>
                    <p>
                        This documentation refers to the Adversarial Search problem. Your solution class 
                        will <b>automatically</b> extend <a href="#AdversarialSearchSolution">AdversarialSearchSolution</a>, 
                        and must override the following functions:
                    </p>
                    <ul className="list-disc *:ml-5">
                        <li><a href="#AdversarialSearchSolution.constructor">constructor</a></li>
                    </ul>
                    <p>
                        Furthermore, if you define multiple classes, the last of those classes will be considered
                        to be the solution class.
                    </p>
                </div>
                <DocsWarning>As of currently, your code is run as-is on your web client. <b>Long-running or infinite</b> loops will therefore crash your web client. Take appropriate actions to mitigate this issue when writing custom code. </DocsWarning>
            </DocsContainer>
        </div>
    )
}
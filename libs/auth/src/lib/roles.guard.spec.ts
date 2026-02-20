import {Role} from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data'
import { ExecutionContext } from '@nestjs/common'
import {ROLE_HIERARCHY, RolesGuard} from "./roles.guard"
import { Reflector } from '@nestjs/core'

function mockContext(role:Role ):ExecutionContext {
    return {
        switchToHttp: () => ({
            getRequest: ()=>({user:{role}}),
        }),
        getHandler: ()=>({}),
        getClass: ()=>({}),
    } as unknown as ExecutionContext
}

describe('RolesGuard',()=>{
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(()=>{
        reflector=new Reflector();
        guard=new RolesGuard(reflector);
    })

    afterEach(()=>jest.clearAllMocks());

    it('should allow any user when no roles are required',()=>{
        jest.spyOn(reflector,'getAllAndOverride').mockReturnValue(undefined);
        expect(guard.canActivate(mockContext(Role.VIEWER))).toBe(true);
    });

    describe("Owner role",()=>{
        it('can access OWNER-only routes',()=>{
            jest.spyOn(reflector,"getAllAndOverride").mockReturnValue([Role.OWNER]);
            expect(guard.canActivate(mockContext(Role.OWNER))).toBe(true);
        })

        it('can access Admin routes',()=>{
            jest.spyOn(reflector,"getAllAndOverride").mockReturnValue([Role.ADMIN]);
            expect(guard.canActivate(mockContext(Role.OWNER))).toBe(true);
        })

        it('can access Viewer routes',()=>{
            jest.spyOn(reflector,"getAllAndOverride").mockReturnValue([Role.VIEWER]);
            expect(guard.canActivate(mockContext(Role.OWNER))).toBe(true);
        })
    })

    describe("Admin role",()=>{
         it('cannot access OWNER-only routes',()=>{
            jest.spyOn(reflector,"getAllAndOverride").mockReturnValue([Role.OWNER]);
            expect(guard.canActivate(mockContext(Role.ADMIN))).toBe(false);
        })

        it('can access Admin routes',()=>{
            jest.spyOn(reflector,"getAllAndOverride").mockReturnValue([Role.ADMIN]);
            expect(guard.canActivate(mockContext(Role.ADMIN))).toBe(true);
        })

        it('can access Viewer routes',()=>{
            jest.spyOn(reflector,"getAllAndOverride").mockReturnValue([Role.VIEWER]);
            expect(guard.canActivate(mockContext(Role.ADMIN))).toBe(true);
        })
    })

    describe('Viewer role', () => {
        it('can access VIEWER routes', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.VIEWER]);
        expect(guard.canActivate(mockContext(Role.VIEWER))).toBe(true);
        });

        it('cannot access ADMIN routes', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
        expect(guard.canActivate(mockContext(Role.VIEWER))).toBe(false);
        });

        it('cannot access OWNER routes', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.OWNER]);
        expect(guard.canActivate(mockContext(Role.VIEWER))).toBe(false);
        });
    });

    it('should deny when no user on request', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.VIEWER]);
        const ctx = {
        switchToHttp: () => ({ getRequest: () => ({}) }), // no user
        getHandler:   () => ({}),
        getClass:     () => ({}),
        } as unknown as ExecutionContext;
        expect(guard.canActivate(ctx)).toBe(false);
    });

    describe('Role Hierarchy map',()=>{
        it('owner inherits OWNER, ADMIN, VIEWER',()=>{
            expect(ROLE_HIERARCHY[Role.OWNER]).toEqual(
                expect.arrayContaining([Role.OWNER, Role.ADMIN, Role.VIEWER])
            )
        })

        it('admin inherits ADMIN, VIEWER',()=>{
            expect(ROLE_HIERARCHY[Role.ADMIN]).toEqual(
                expect.arrayContaining([Role.ADMIN, Role.VIEWER])
            )
            expect(ROLE_HIERARCHY[Role.ADMIN]).not.toContain(Role.OWNER);
        })

        it('VIEWER only has VIEWER', () => {
            expect(ROLE_HIERARCHY[Role.VIEWER]).toEqual([Role.VIEWER]);
        });
    })

})